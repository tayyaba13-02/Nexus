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
    # When cookies are present, we prioritize clients that support them (web, mweb)
    if cookie_file:
        clients_to_try = [
            {'client': ['web'], 'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'},
            {'client': ['mweb'], 'ua': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'},
            {'client': ['tv_embedded'], 'ua': 'Mozilla/5.0 (SMART-TV; Linux; Tizen 5.0) AppleWebkit/537.36 (KHTML, like Gecko) SamsungBrowser/2.2 Chrome/63.0.3239.111 TV Safari/537.36'}
        ]
    else:
        clients_to_try = [
            {'client': ['tv_embedded'], 'ua': 'Mozilla/5.0 (SMART-TV; Linux; Tizen 5.0) AppleWebkit/537.36 (KHTML, like Gecko) SamsungBrowser/2.2 Chrome/63.0.3239.111 TV Safari/537.36'},
            {'client': ['ios'], 'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'},
            {'client': ['android'], 'ua': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'},
            {'client': ['web_embedded'], 'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'},
            {'client': ['mweb'], 'ua': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'}
        ]
    
    last_error = None
    for attempt, config in enumerate(clients_to_try):
        # Stealth Jitter: Wait slightly before retrying to look less like a bot
        if attempt > 0:
            time.sleep(random.uniform(2.0, 5.0))

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_template,
            'noplaylist': True,
            'quiet': True,
            'force_ipv4': True,
            'nocheckcertificate': True,
            'extractor_args': {'youtube': {'player_client': config['client']}},
            'referer': 'https://www.youtube.com/',
            'http_headers': {
                'User-Agent': config['ua'],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        }
        
        if cookie_file:
            ydl_opts['cookiefile'] = cookie_file
            
        try:
            # print(f"DEBUG: Attempting stealth import {attempt+1} with {config['client']}...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                # ... [Rest of logic follows if successful]
                filename = ydl.prepare_filename(info)
                
                actual_filename = None
                for f in os.listdir(UPLOAD_DIR):
                    if f.startswith(file_id):
                        actual_filename = f
                        break
                
                if not actual_filename:
                    continue # Try next client if file not found locally
                    
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
            error_str = str(e).lower()
            if "sign in to confirm you’re not a bot" in error_str or "bot" in error_str:
                continue
            else:
                continue # Try other clients for any error to be robust

    # If all clients failed
    error_msg = str(last_error) if last_error else "Unknown error"
    print(f"Final Import failure: {error_msg}")
    
    user_help = " YouTube is blocking the server. Please add your YOUTUBE_COOKIES secret in Settings (see walkthrough)."
    raise HTTPException(status_code=500, detail=f"Import failed after trying 5 methods: {error_msg}. {user_help}")
