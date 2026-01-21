from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Form
from fastapi.responses import FileResponse
import shutil
import os
import uuid
from typing import Optional, List
from models.song import Song

router = APIRouter()

# Directory to store uploaded songs
UPLOAD_DIR = "uploaded_songs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_song(
    file: UploadFile = File(...),
    x_user_id: Optional[str] = Header(None),
    moods: Optional[str] = Form(None)
):
    if not file.filename.lower().endswith((".mp3", ".wav", ".ogg", ".mpeg", ".m4a")):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{file_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract metadata using Mutagen
    duration = None
    try:
        from mutagen import File as MutagenFile
        audio = MutagenFile(file_path)
        if audio is not None and audio.info is not None:
            duration = audio.info.length
    except Exception as e:
        print(f"Error extracting metadata: {e}")
    
    # Parse moods from comma-separated string
    mood_list = [m.strip() for m in moods.split(',')] if moods else []
    
    # Save metadata to DB
    new_song = Song(
        _id=file_id,
        filename=file.filename,
        original_filename=file_name,
        url=f"/api/songs/{file_id}",
        duration=duration,
        owner_id=x_user_id,
        moods=mood_list
    )
    await new_song.create()
        
    return new_song

@router.get("/{song_id}")
async def get_song(song_id: str):
    # Serving remains global for efficiency/sharing, but metadata leads to this
    for f in os.listdir(UPLOAD_DIR):
        if f.startswith(song_id):
            return FileResponse(os.path.join(UPLOAD_DIR, f))
    raise HTTPException(status_code=404, detail="Song not found")

@router.get("", response_model=List[Song])
@router.get("/", response_model=List[Song], include_in_schema=False)
async def list_songs(x_user_id: Optional[str] = Header(None)):
    # Filter by owner_id if provided
    if x_user_id:
        songs = await Song.find(Song.owner_id == x_user_id).to_list()
    else:
        # Fallback for older songs or global view (if needed)
        songs = await Song.find_all().to_list()
    return songs

@router.delete("/{id}", status_code=204)
async def delete_song(id: str, x_user_id: Optional[str] = Header(None)):
    song = await Song.get(id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Security: Only owner can delete (Relaxed for portfolio cleanup)
    # if song.owner_id and song.owner_id != x_user_id:
    #     raise HTTPException(status_code=403, detail="Not authorized to delete this song")
    
    await song.delete()



@router.get("/moods/{mood}")
async def get_songs_by_mood(mood: str, x_user_id: Optional[str] = Header(None)):
    """
    Get all songs filtered by a specific mood.
    """
    query = {"moods": mood}
    if x_user_id:
        query["owner_id"] = x_user_id
    
    songs = await Song.find(query).to_list()
    return songs
