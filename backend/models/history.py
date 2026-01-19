from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class ListeningHistory(Document):
    song_id: str
    owner_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "listening_history"
