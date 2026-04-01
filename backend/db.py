import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.playlist import Playlist
from models.song import Song

async def init_db():
    # Use environment variable with local fallback for portability
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    
    # Safety check for Beanie/Motor compatibility
    # Ensure append_metadata is not treated as a callable if it's missing
    if not hasattr(client, 'append_metadata') or not callable(getattr(client, 'append_metadata', None)):
        client.append_metadata = lambda *args, **kwargs: None
    
    # Initialize Beanie with the Nexus database and models
    from models.history import ListeningHistory
    
    await init_beanie(
        database=client.nexus_db,
        document_models=[Song, Playlist, ListeningHistory]
    )
