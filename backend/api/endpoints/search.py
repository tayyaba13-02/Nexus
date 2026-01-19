from fastapi import APIRouter, Query
from typing import List, Dict, Any
from models.song import Song
from models.playlist import Playlist
import re

router = APIRouter()

@router.get("/", response_model=Dict[str, List[Any]])
async def search(query: str = Query(..., min_length=1)):
    """
    Search for songs and playlists matching the query string.
    """
    if not query:
        return {"songs": [], "playlists": []}

    # Case-insensitive regex search
    regex_pattern = {"$regex": query, "$options": "i"}

    # Search Songs (filename, title, artist)
    # Note: 'title' field might not be populated for all, focusing on filename/artist
    songs = await Song.find(
        {
            "$or": [
                {"filename": regex_pattern},
                {"original_filename": regex_pattern},
                {"artist": regex_pattern},
                {"title": regex_pattern} 
            ]
        }
    ).to_list()

    # Search Playlists (name)
    playlists = await Playlist.find(
        {"name": regex_pattern}
    ).to_list()

    return {
        "songs": songs,
        "playlists": playlists
    }
