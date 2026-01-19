import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from mutagen import File as MutagenFile
from dotenv import load_dotenv

# Load env if needed, but we'll default to local
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "nexus_db"
UPLOAD_DIR = "uploaded_songs"

async def fix_durations():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    songs_collection = db.get_collection("songs")
    
    songs = await songs_collection.find({}).to_list(length=1000)
    print(f"Found {len(songs)} songs.")
    
    updated_count = 0
    
    for song in songs:
        # Check if duration is missing
        if song.get("duration") is None:
            # Construct file path
            # We need to find the file extension from the ID if not stored, 
            # or try to find the file on disk.
            # The current backend uses {id}{ext} schema on disk.
            
            song_id = song["_id"]
            found_path = None
            
            # Try to find file on disk
            for ext in [".mp3", ".wav", ".ogg", ".mpeg", ".m4a"]:
                test_path = os.path.join(UPLOAD_DIR, f"{song_id}{ext}")
                if os.path.exists(test_path):
                    found_path = test_path
                    break
            
            if found_path:
                try:
                    audio = MutagenFile(found_path)
                    if audio is not None and audio.info is not None:
                        duration = audio.info.length
                        await songs_collection.update_one(
                            {"_id": song_id},
                            {"$set": {"duration": duration}}
                        )
                        print(f"Updated {song.get('filename')} duration to {duration:.2f}s")
                        updated_count += 1
                except Exception as e:
                    print(f"Failed to read {found_path}: {e}")
            else:
                print(f"File for song {song.get('filename')} (ID: {song_id}) not found on disk.")
        else:
            # print(f"Song {song.get('filename')} already has duration.")
            pass

    # Now backfill playlists
    print("Backfilling playlists...")
    playlists_collection = db.get_collection("playlists")
    playlists = await playlists_collection.find({}).to_list(length=100)
    
    playlist_updated_count = 0
    for playlist in playlists:
        modified = False
        new_songs = []
        for song_ref in playlist.get("songs", []):
            # If duration is missing, try to find it in songs collection
            if song_ref.get("duration") is None:
                # Look up original song
                original_song = await songs_collection.find_one({"_id": song_ref.get("id")})
                if original_song and original_song.get("duration"):
                    song_ref["duration"] = original_song.get("duration")
                    modified = True
            new_songs.append(song_ref)
        
        if modified:
            await playlists_collection.update_one(
                {"_id": playlist["_id"]},
                {"$set": {"songs": new_songs}}
            )
            print(f"Updated playlist: {playlist.get('name')}")
            playlist_updated_count += 1
            
    print(f"Finished. Updated {updated_count} songs and {playlist_updated_count} playlists.")

if __name__ == "__main__":
    # Change to backend dir to ensure relative paths work if needed, 
    # but here we assume script is run from project root or checks relative to it.
    # Actually, UPLOAD_DIR is in backend/uploaded_songs usually? 
    # Let's check where the user's UPLOAD_DIR is. 
    # Based on previous logs: c:/Users/user/OneDrive/Desktop/Internship Month2/Nexus/backend/uploaded_songs
    
    os.chdir("c:/Users/user/OneDrive/Desktop/Internship Month2/Nexus/backend")
    asyncio.run(fix_durations())
