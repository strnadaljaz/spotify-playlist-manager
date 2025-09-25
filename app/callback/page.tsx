'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Processing...');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spotify-playlist-manager-backend-atej.onrender.com';

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
            setStatus('Authentication failed: ' + error);
            return;
        }

        if (!code) {
            setStatus('No authorization code received');
            return;
        }

        // Exchange code for access token
        const exchangeCodeForToken = async () => {
            try {
                const response = await fetch(`${backendUrl}/callback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, state })
                });

                const data = await response.json();

                // Save spotify id to local storage
                localStorage.setItem("user_id", data.spotify_id);

                if (data.error) {
                    setStatus('Error: ' + data.error);
                    return;
                }
                
                setStatus('Authentication successful! Redirecting...');
                
                // Redirect to dashboard or main app
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);

            } catch (error) {
                console.error('Error:', error);
                setStatus('An error occurred during authentication');
            }
        };

        exchangeCodeForToken();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-white text-2xl mb-4">Spotify Authentication</h1>
                <p className="text-gray-300">{status}</p>
            </div>
        </div>
    );
}

export default function Callback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-white text-2xl mb-4">Spotify Authentication</h1>
                    <p className="text-gray-300">Loading...</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}