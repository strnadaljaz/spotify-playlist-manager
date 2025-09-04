'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('spotify_access_token');
        
        if (!token) {
            router.push('/');
            return;
        }

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

        fetchUserInfo();
    }, [router]);

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-white text-4xl font-bold mb-8">Dashboard</h1>
                
                {userInfo && (
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-white text-xl mb-4">Welcome, name!</h2>
                        <p className="text-gray-300">You're successfully authenticated with Spotify.</p>
                    </div>
                )}
            </div>
        </div>
    );
}