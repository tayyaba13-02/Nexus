from beanie import Document
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SongRef(BaseModel):
    id: str
    filename: str
    title: Optional[str] = None
    artist: Optional[str] = None
    duration: Optional[float] = None
    url: str

class Playlist(Document):
    name: str
    description: Optional[str] = None
    songs: List[SongRef] = []
    owner_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "playlists"
