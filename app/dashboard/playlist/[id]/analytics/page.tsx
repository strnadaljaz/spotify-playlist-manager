'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AnalyzePage() {
    const [artists, setArtists] = useState<{ [key: string]: number } | null>(null);
    const [spotifyId, setSpotifyId] = useState<string | null>(null);
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spotify-playlist-manager-backend-atej.onrender.com';

    const router = useRouter();
    const params = useParams();

    const playlist_id = params.id as string;

    useEffect(() => {
        const spotify_id = localStorage.getItem('spotify_id');

        if (!spotify_id) {
            router.push('/');
            return;
        }

        setSpotifyId(spotify_id);
    }, [router, playlist_id]);

    async function getArtists (playlist_id: string, spotify_id: string) {
        if (!playlist_id) {
            console.error('No playlist id');
            return;
        }
        if (!spotify_id) {
            console.error('No spotify id');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/getTracks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playlist_id, spotify_id
                })
            });

            if (!response.ok) {
                console.error(response.statusText);
            }

            const track_data = await response.json();
            const items = track_data.tracks.tracks.items;

            const artists_count: { [key: string]: number} = {};

            for (const item of items) {
                const artists = item.track.artists
                for (const artist of artists) {
                    if (!artists_count[artist.name]){
                        artists_count[artist.name] = 0;
                    }
                    artists_count[artist.name] += 1;
                }
            }
            
            const sorted_artists_count = Object.fromEntries(
                Object.entries(artists_count).sort(([,a],[,b]) => b - a)
            );

            const top_five_artists = Object.fromEntries(
                Object.entries(sorted_artists_count).slice(0, 5)
            );

            return top_five_artists;
        } catch (error) {
            console.error('Error getting tracks: ', error);
            return;
        }
    }

    useEffect(() => {
        if (!spotifyId || !playlist_id) return;

        const fetchData = async () => {
            const data = await getArtists(playlist_id, spotifyId);
            if (data) {
                setArtists(data);
            }
        } 

        fetchData();
    }, [playlist_id, spotifyId]);

    return (
        <div>
            {artists ? (
                <pre>{JSON.stringify(artists, null, 2)}</pre> // Example rendering
            ) : (
                <p>Loading artists...</p>
            )}
        </div>
    );
}