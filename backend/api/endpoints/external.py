from fastapi import APIRouter, Query, HTTPException, Header
from typing import List, Dict, Any, Optional
import yt_dlp
import os
import uuid
from models.song import Song

router = APIRouter()

UPLOAD_DIR = "uploaded_songs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/search")
async def search_external(q: str = Query(..., min_length=1)):
    """
    Search YouTube for videos using yt-dlp.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'extract_flat': True,
        'force_generic_extractor': False,
        'force_ipv4': True,
    }
    
    try:
        search_query = f"ytsearch10:{q}"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            results = ydl.extract_info(search_query, download=False)
            
            formatted_results = []
            if 'entries' in results:
                for entry in results['entries']:
                    if not entry: continue
                    formatted_results.append({
                        "id": entry.get('id'),
                        "title": entry.get('title'),
                        "thumbnails": [{"url": entry.get('thumbnails', [{}])[0].get('url')} if entry.get('thumbnails') else {"url": ""}],
                        "duration": str(int(entry.get('duration', 0) // 60)) + ":" + str(int(entry.get('duration', 0) % 60)).zfill(2) if entry.get('duration') else "0:00",
                        "channel": entry.get('uploader', 'Unknown Channel'),
                        "link": f"https://www.youtube.com/watch?v={entry.get('id')}"
                    })
            
            return {"results": formatted_results}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import")
async def import_from_youtube(video_url: str, x_user_id: Optional[str] = Header(None), moods: Optional[str] = None):
    """
    Download audio from YouTube and register it in the local library.
    """
    file_id = str(uuid.uuid4())
    # We use a temporary template to find the actual extension later
    output_template = f"{UPLOAD_DIR}/{file_id}.%(ext)s"
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'noplaylist': True,
        'quiet': True,
        # Avoid ffmpeg dependence for now, yt-dlp can get the actual format
        # but we need to know the final file path
        'force_ipv4': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            filename = ydl.prepare_filename(info)
            # Sometimes prepare_filename gives the template, let's find the actual file
            actual_filename = None
            for f in os.listdir(UPLOAD_DIR):
                if f.startswith(file_id):
                    actual_filename = f
                    break
            
            if not actual_filename:
                raise HTTPException(status_code=500, detail="Failed to download file")
                
            file_path = os.path.join(UPLOAD_DIR, actual_filename)
            
            # Extract metadata
            duration = info.get('duration')
            title = info.get('title', 'Unknown External Track')
            artist = info.get('uploader', 'Unknown Artist')
            
            # Parse moods from comma-separated string
            mood_list = [m.strip() for m in moods.split(',')] if moods else []
            
            # Save to DB
            new_song = Song(
                _id=file_id,
                filename=f"{title}.{actual_filename.split('.')[-1]}",
                original_filename=actual_filename,
                url=f"/api/songs/{file_id}",
                artist=artist,
                duration=duration,
                owner_id=x_user_id,
                moods=mood_list
            )
            await new_song.create()
            
            return new_song
            
    except Exception as e:
        # Cleanup on failure if possible
        print(f"Import error: {e}")
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
