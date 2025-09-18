'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AnalyzePage() {
    const [artists, setArtists] = useState('');
    const [spotifyId, setSpotifyId] = useState<string | null>(null);
    
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

    return (
        <div>

        </div>
    );
}