import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Player from './components/Player';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import LikedSongs from './pages/LikedSongs';
import SearchPage from './pages/SearchPage';
import Analytics from './pages/Analytics';
import PlaylistDetail from './pages/PlaylistDetail';

import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a1210] text-white font-sans selection:bg-[#268168]/30">
        <Header />

        <div className="container mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-28 md:pb-32 flex flex-col md:flex-row gap-4 md:gap-8 min-h-[calc(100vh-4rem)]">
          <Sidebar />

          <main className="flex-1 w-full min-w-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/liked" element={<LikedSongs />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>

        <Footer />
        <ErrorBoundary>
          <Player />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
