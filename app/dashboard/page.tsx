'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState(null);
    const [token, setToken] = useState(null);
    const [playlistsData, setPlaylistsData] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const spotify_id = localStorage.getItem("spotify_id");

        const fetchToken = async () => {
            
            if (!spotify_id) {
                router.push('/');
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:3001/getAccessToken", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ spotify_id })
                });

                if (!response.ok) {
                    router.push('/');
                    return;
                }

                const data = await response.json();
                setToken(data.access_token); // Assuming your API returns { access_token: "..." }
            } catch (error) {
                console.error('Error fetching token:', error);
                router.push('/');
            }
        };

        const fetchPlaylistsData = async () => {
            if (!spotify_id) {
                router.push('/');
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:3001/getPlaylistsData", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ spotify_id })
                });

                if (!response.ok) {
                    router.push('/');
                    return;
                }

                const data = await response.json();
                setPlaylistsData(data.playlists_data);

            } catch (error) {
                console.error(error);
                router.push('/');
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
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUserInfo(userData);
                } else {
                    // Token might be expired
                    localStorage.removeItem('spotify_access_token');
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo()
    }, [token, router]);

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-white text-4xl font-bold mb-8">Dashboard</h1>
                {userInfo && (
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-white text-xl mb-4">Welcome, {userInfo.display_name}</h2>
                        <p className="text-gray-300">You're successfully authenticated with Spotify.</p>
                    </div>
                )}
            </div>
        </div>
    );
}