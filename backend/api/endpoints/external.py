from fastapi import APIRouter, Query, HTTPException, Header
from typing import List, Dict, Any, Optional
import yt_dlp
import os
import uuid
import time
import random
from models.song import Song

router = APIRouter()

UPLOAD_DIR = "uploaded_songs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/search")
async def search_external(q: str = Query(..., min_length=1)):
    """
    Search YouTube for videos using ytmusicapi.
    """
    try:
        from ytmusicapi import YTMusic
        yt = YTMusic()
        results = yt.search(q, filter="songs")
        
        formatted_results = []
        for entry in results:
            # Safe extraction of artist
            artists = entry.get('artists', [])
            artist_name = artists[0]['name'] if artists else "Unknown Artist"
            
            # Safe extraction of thumbnails
            thumbnails = entry.get('thumbnails', [])
            thumbnail_url = thumbnails[-1]['url'] if thumbnails else ""
            
            formatted_results.append({
                "id": entry.get('videoId'),
                "title": entry.get('title'),
                "thumbnails": [{"url": thumbnail_url}],
                "duration": entry.get('duration', "0:00"),
                "channel": artist_name,
                "link": f"https://www.youtube.com/watch?v={entry.get('videoId')}"
            })
            
        return {"results": formatted_results}
    except Exception as e:
        print(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import")
async def import_from_youtube(video_url: str, x_user_id: Optional[str] = Header(None), moods: Optional[str] = None):
    """
    Download audio from YouTube and register it in the local library with smart client rotation.
    """
    file_id = str(uuid.uuid4())
    output_template = f"{UPLOAD_DIR}/{file_id}.%(ext)s"
    
    cookies_content = os.getenv("YOUTUBE_COOKIES")
    cookie_file = None
    if cookies_content:
        cookie_file = "cookies.txt"
        with open(cookie_file, "w") as f:
            f.write(cookies_content)

    # List of client types and stealth settings to try
    # Expanded list to cover every possible fallback
    if cookie_file:
        clients_to_try = [
            {'client': ['web'], 'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'},
            {'client': ['mweb'], 'ua': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36'},
            {'client': ['tv_embedded'], 'ua': 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebkit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/88.0.4324.182 TV Safari/537.36'},
            {'client': ['android_music'], 'ua': 'com.google.android.apps.youtube.music/6.41.52 (Linux; U; Android 14; en_US; Pixel 8 Pro; Build/UQ1A.240205.004)'}
        ]
    else:
        clients_to_try = [
            {'client': ['tv_embedded'], 'ua': 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebkit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/88.0.4324.182 TV Safari/537.36'},
            {'client': ['android_music'], 'ua': 'com.google.android.apps.youtube.music/6.41.52 (Linux; U; Android 14; en_US; Pixel 8 Pro; Build/UQ1A.240205.004)'},
            {'client': ['ios'], 'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'},
            {'client': ['android'], 'ua': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36'},
            {'client': ['web_embedded'], 'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'}
        ]
    
    last_error = None
    for attempt, config in enumerate(clients_to_try):
        if attempt > 0:
            # Random jitter to prevent IP ban
            time.sleep(random.uniform(3.0, 7.0))

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_template,
            'noplaylist': True,
            'quiet': True,
            'verbose': True, # Add logs for cleaner debugging in HF Space
            'force_ipv4': True,
            'nocheckcertificate': True,
            'rm_cachedir': True, # Clear cache for every attempt
            'remote_components': ['ejs:github'], # Crucial: moved to top level
            'extractor_args': {
                'youtube': {
                    'player_client': config['client'],
                }
            },
            'allow_unplayable_formats': True, # Fallback if signature solving is partial
            'referer': 'https://www.youtube.com/',
            'http_headers': {
                'User-Agent': config['ua'],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Sec-Fetch-Mode': 'navigate',
            }
        }
        
        if cookie_file:
            ydl_opts['cookiefile'] = cookie_file
            
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # We use extract_info directly with download=True
                info = ydl.extract_info(video_url, download=True)
                
                actual_filename = None
                for f in os.listdir(UPLOAD_DIR):
                    if f.startswith(file_id):
                        actual_filename = f
                        break
                
                if not actual_filename:
                    continue
                    
                duration = info.get('duration')
                title = info.get('title', 'Unknown External Track')
                artist = info.get('uploader', 'Unknown Artist')
                mood_list = [m.strip() for m in moods.split(',')] if moods else []
                
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
            last_error = e
            error_msg = str(e).lower()
            print(f"DEBUG: Attempt {attempt+1} ({config['client']}) failed: {error_msg[:200]}")
            
            # If cookies are explicitly rejected, stop rotation and warn user
            if "cookies are no longer valid" in error_msg or "rotated in the browser" in error_msg:
                raise HTTPException(
                    status_code=401, 
                    detail="YouTube cookies have expired or rotated. PLEASE: 1. Open YouTube in your browser. 2. Perform any search. 3. RE-EXPORT fresh cookies using 'Get cookies.txt LOCALLY' extension. 4. Update the YOUTUBE_COOKIES secret on Hugging Face."
                )
            
            # Continue to next client for ANY other error
            continue

    # Final Failure Message
    error_msg = str(last_error) if last_error else "All download methods exhausted."
    user_hint = ""
    if "requested format is not available" in str(error_msg).lower():
        user_hint = " Your cookies might be expired or don't have enough permission for this specific video."
    
    raise HTTPException(status_code=500, detail=f"Import blocked by YouTube: {error_msg}.{user_hint} Check walkthrough.md.")
