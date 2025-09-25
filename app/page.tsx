'use client';

import React from "react";
import SpotifyLogo from "./components/SpotifyLogo";

export default function Home() {

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://spotify-playlist-manager-backend-atej.onrender.com";

  const handleLoginClick = async () => {
    try {
      const response = await fetch(`${backendUrl}/getAuthorizationUrl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const authUrl = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-4xl font-bold mb-8">
          Spotify Playlist Manager
        </h1>
        <button onClick={handleLoginClick} className="bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-8 rounded-full flex items-center gap-3 mx-auto transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer">
          <SpotifyLogo />
          Login with Spotify
        </button>
      </div>
    </div>
  );
}
