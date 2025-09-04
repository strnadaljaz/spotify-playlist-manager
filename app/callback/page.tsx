'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Callback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Processing...');

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
                const response = await fetch('http://localhost:3001/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, state })
                });

                const data = await response.json();

                if (data.error) {
                    setStatus('Error: ' + data.error);
                    return;
                }

                // Store the access token (you might want to use a more secure method)
                localStorage.setItem('spotify_access_token', data.access_token);
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
                
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