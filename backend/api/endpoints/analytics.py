from fastapi import APIRouter, HTTPException, Header
from typing import List, Dict, Any, Optional

from models.history import ListeningHistory
from models.song import Song
from datetime import datetime, timedelta
from collections import Counter

router = APIRouter()

@router.post("/track")
async def track_play(song_id: str, x_user_id: Optional[str] = Header(None)):
    """
    Record a play event for a song.
    """
    event = ListeningHistory(song_id=song_id, owner_id=x_user_id)
    await event.insert()
    return {"status": "success"}

@router.get("/stats")
async def get_stats(x_user_id: Optional[str] = Header(None)):
    """
    Get aggregated listening stats for the current user.
    """
    # Filter history by owner_id
    if x_user_id:
        history = await ListeningHistory.find(ListeningHistory.owner_id == x_user_id).to_list()
    else:
        history = await ListeningHistory.find_all().to_list()
    
    # Calculate Top Songs
    song_counts = Counter(h.song_id for h in history)
    top_song_ids = song_counts.most_common(5)
    
    top_songs = []
    for song_id, count in top_song_ids:
        song = await Song.get(song_id)
        if song:
            top_songs.append({
                "id": song_id,
                "filename": song.filename,
                "artist": song.artist,
                "plays": count
            })

    # Calculate Plays per day (last 7 days, filtered by user)
    now = datetime.now()
    daily_stats = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        count = sum(1 for h in history if h.timestamp.date() == day)
        daily_stats.append({
            "name": day.strftime("%a"),
            "plays": count
        })

    return {
        "top_songs": top_songs,
        "daily_activity": daily_stats,
        "total_plays": len(history)
    }
