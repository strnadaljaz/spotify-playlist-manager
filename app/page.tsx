'use client';
import React from "react";

// import { useRouter } from 'next/navigation';

export default function Home() {
  // const router = useRouter();

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
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Login with Spotify
        </button>
      </div>
    </div>
  );
}
