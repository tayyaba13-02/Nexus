---
title: Nexus Music Player
emoji: 🎵
colorFrom: green
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

# Nexus Music 

Nexus is a premium, high-performance music streaming application with a sleek **Emerald Design System**. Built with FastAPI and React, it offers a fast, modern, and cloud-native experience for managing your personal music collection without the need for traditional accounts.

##  Key Features

-  Emerald UI/UX: A stunning, high-contrast dark theme with glassmorphism and smooth Framer Motion animations.
-  Anonymous Identity: Privacy-first design. No passwords or accounts—Nexus uses a unique **Identity Key** stored in your browser to isolate your library.
-  Mood tagging: Organize your music by vibe. Tag songs with 8 core moods (Happy, Chill, Energetic, etc.) and filter your library with one tap.
-  YouTube Import: Search any song on YouTube and import it directly into your local cloud library with full metadata extraction.
-  PWA Native Experience: Install Nexus on your Desktop or Mobile device. Includes a dedicated PWA install flow and offline-ready service workers.
-  Real-time Analytics: Built-in listening statistics and habit tracking using Recharts.

##  Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Vanilla Emerald Palette)
- **State**: Zustand (Persisted Storage)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **API**: FastAPI (Python 3.10+)
- **Database**: MongoDB (ODM: Beanie & Motor)
- **Processing**: yt-dlp (YouTube Search/Import), Mutagen (Metadata)
- **Server**: Uvicorn

##  Getting Started

### Backend Setup
1. Navigate to `/backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `uvicorn main:app --reload`
*Note: Requires a running MongoDB instance.*

### Frontend Setup
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Start development: `npm run dev`

---
**Nexus: Discover the Rhythm of Your Soul**


