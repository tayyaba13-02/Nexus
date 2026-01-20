from fastapi import FastAPI
import socket

# Global IPv4 Patch: Force all socket connections to use IPv4
# This fixes [Errno -5] No address associated with hostname in Hugging Face Spaces
old_getaddrinfo = socket.getaddrinfo
def new_getaddrinfo(*args, **kwargs):
    responses = old_getaddrinfo(*args, **kwargs)
    return [response for response in responses if response[0] == socket.AF_INET]
socket.getaddrinfo = new_getaddrinfo


from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import songs, playlists, search
from db import init_db

app = FastAPI(title="Nexus Music Player API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

from api.endpoints import songs, playlists, search, analytics, external

from fastapi.staticfiles import StaticFiles
import os

app.include_router(songs.router, prefix="/api/songs", tags=["songs"])
app.include_router(playlists.router, prefix="/api/playlists", tags=["playlists"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(external.router, prefix="/api/external", tags=["external"])

# Serve Static Files
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to Nexus API (Static folder not found)"}
