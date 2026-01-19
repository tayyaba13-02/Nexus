from typing import Optional, List
from beanie import Document
from pydantic import Field
from datetime import datetime

class Song(Document):
    id: str = Field(alias="_id")
    filename: str
    original_filename: str
    url: str
    artist: Optional[str] = None
    duration: Optional[float] = None
    owner_id: Optional[str] = None
    moods: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "songs"
