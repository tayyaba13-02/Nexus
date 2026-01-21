from fastapi import FastAPI
import socket
import dns.resolver

# Robust DNS Patch: Fallback to Google DNS if system DNS fails
# This fixes persistent [Errno -5] errors in Hugging Face Spaces
old_getaddrinfo = socket.getaddrinfo

def new_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    try:
        # 1. Try system DNS first / existing IPv4 filter logic
        responses = old_getaddrinfo(host, port, family, type, proto, flags)
        return [response for response in responses if response[0] == socket.AF_INET]
    except socket.gaierror:
        # 2. If system fails, try Google DNS (8.8.8.8) via dnspython
        try:
            # Only attempt this for hostname lookups (not IPs)
            if not host or host == '0.0.0.0' or host == 'localhost':
                 raise
                 
            # print(f"DEBUG: System DNS failed for {host}, trying Google DNS...")
            resolver = dns.resolver.Resolver()
            resolver.nameservers = ['8.8.8.8']
            answers = resolver.resolve(host, 'A')
            ip = answers[0].to_text()
            
            # Construct a valid getaddrinfo response structure using the resolved IP
            # (family, type, proto, canonname, sockaddr)
            # sockaddr for AF_INET is (ip, port)
            return [(socket.AF_INET, type, proto, '', (ip, port))]
        except Exception:
            # If fallback also fails, raise the original system error
            raise

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
