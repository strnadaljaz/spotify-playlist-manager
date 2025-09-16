"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SpotifyPlaylist, SpotifyUserInfo } from "./defines";
import Image from "next/image";

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<SpotifyUserInfo | null>(null);
    const [token, setToken] = useState(null);
    const [playlistsData, setPlaylistsData] = useState<SpotifyPlaylist[] | null>(null);
    const router = useRouter();

    useEffect(() => {
        const spotify_id = localStorage.getItem("spotify_id");

        const fetchToken = async () => {
            
            if (!spotify_id) {
                router.push("/");
                return;
            }

            try {
                const response = await fetch("https://spotify-playlist-manager-backend-atej.onrender.com/getAccessToken", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ spotify_id })
                });

                if (!response.ok) {
                    router.push("/");
                    return;
                }

                const data = await response.json();
                setToken(data.access_token); 
            } catch (error) {
                console.error("Error fetching token:", error);
                router.push("/");
            }
        };

        const fetchPlaylistsData = async () => {
            if (!spotify_id) {
                router.push("/");
                return;
            }

            try {
                const response = await fetch("https://spotify-playlist-manager-backend-atej.onrender.com/getPlaylistsData", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ spotify_id })
                });

                if (!response.ok) {
                    router.push("/");
                    return;
                }

                const data = await response.json();
                setPlaylistsData(data.playlists_data.items);

            } catch (error) {
                console.error(error);
                router.push("/");
            }
        }

        fetchToken();
        fetchPlaylistsData();
    }, [router]);

    useEffect(() => {
        if (!token) return;

        // Fetch user info to verify token works
        const fetchUserInfo = async () => {
            try {
                const response = await fetch("https://api.spotify.com/v1/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUserInfo(userData);
                } else {
                    // Token might be expired
                    localStorage.removeItem("spotify_access_token");
                    router.push("/");
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo()
    }, [token, router]);

    const handlePlaylistClick = (playlistId: string) => {
        router.push(`/dashboard/playlist/${playlistId}`);
    }

    if (!playlistsData) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading playlists...</p>
            </div>
          </div>  
        );
    }

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-white text-4xl font-bold mb-8">Dashboard</h1>
                {userInfo && (
                    <div className="bg-gray-800 p-6 rounded-lg mb-8">
                        <h2 className="text-white text-xl mb-4">Welcome, {userInfo.display_name}</h2>
                        <p className="text-gray-300">You"re successfully authenticated with Spotify.</p>
                    </div>
                )}
                
                {/* Playlists Section */}
                <div className="mb-8">
                    <h2 className="text-white text-2xl font-semibold mb-6">Your Playlists</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {playlistsData && playlistsData.map((playlist) => (
                            <div 
                                key={playlist.id} 
                                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors duration-200 cursor-pointer group"
                                onClick={() => handlePlaylistClick(playlist.id)}
                            >
                                <div className="aspect-square mb-4 overflow-hidden rounded-md">
                                    <img
                                        src={playlist.images[0]?.url || "/placeholder-playlist.png"} 
                                        alt={`${playlist.name} playlist cover`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-gray-400 text-xs">
                                        {playlist.tracks?.total || 0} tracks
                                    </p>
                                    {playlist.description && (
                                        <p className="text-gray-500 text-xs line-clamp-2 mt-1">
                                            {playlist.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}