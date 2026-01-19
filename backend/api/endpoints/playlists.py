from fastapi import APIRouter, HTTPException, status, Header
from typing import List, Optional
from models.playlist import Playlist, SongRef
from pydantic import BaseModel

router = APIRouter()

class CreatePlaylist(BaseModel):
    name: str
    description: str = None

@router.post("", response_model=Playlist, status_code=status.HTTP_201_CREATED)
async def create_playlist(playlist_data: CreatePlaylist, x_user_id: Optional[str] = Header(None)):
    playlist = Playlist(
        name=playlist_data.name, 
        description=playlist_data.description,
        owner_id=x_user_id
    )
    await playlist.insert()
    return playlist

@router.get("", response_model=List[Playlist])
async def get_playlists(x_user_id: Optional[str] = Header(None)):
    if x_user_id:
        return await Playlist.find(Playlist.owner_id == x_user_id).to_list()
    return await Playlist.find_all().to_list()

@router.get("/{id}", response_model=Playlist)
async def get_playlist(id: str, x_user_id: Optional[str] = Header(None)):
    playlist = await Playlist.get(id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    # Ownership Check (Optional: Allow viewing if you have the ID, but filter list)
    if playlist.owner_id and playlist.owner_id != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this playlist")
        
    return playlist

@router.post("/{id}/songs", response_model=Playlist)
async def add_song_to_playlist(id: str, song: SongRef, x_user_id: Optional[str] = Header(None)):
    playlist = await Playlist.get(id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.owner_id and playlist.owner_id != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this playlist")
    
    if not any(s.id == song.id for s in playlist.songs):
         playlist.songs.append(song)
         await playlist.save()
         
    return playlist

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_playlist(id: str, x_user_id: Optional[str] = Header(None)):
    playlist = await Playlist.get(id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.owner_id and playlist.owner_id != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this playlist")
        
    await playlist.delete()

class UpdatePlaylist(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

@router.put("/{id}", response_model=Playlist)
async def update_playlist(id: str, playlist_data: UpdatePlaylist, x_user_id: Optional[str] = Header(None)):
    playlist = await Playlist.get(id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.owner_id and playlist.owner_id != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this playlist")
    
    if playlist_data.name is not None:
        playlist.name = playlist_data.name
    if playlist_data.description is not None:
        playlist.description = playlist_data.description
        
    await playlist.save()
    return playlist

@router.delete("/{id}/songs/{song_id}", response_model=Playlist)
async def remove_song_from_playlist(id: str, song_id: str, x_user_id: Optional[str] = Header(None)):
    playlist = await Playlist.get(id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    if playlist.owner_id and playlist.owner_id != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this playlist")
    
    original_length = len(playlist.songs)
    playlist.songs = [s for s in playlist.songs if s.id != song_id]
    
    if len(playlist.songs) == original_length:
         raise HTTPException(status_code=404, detail="Song not found in playlist")

    await playlist.save()
    return playlist
