'use client';

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PieChart } from '@mui/x-charts/PieChart';
import { SpotifyPlaylistItem } from '../../../defines';

export default function AnalyzePage() {
    const [artists, setArtists] = useState<{ [key: string]: number } | null>(null);
    const [spotifyId, setSpotifyId] = useState<string | null>(null);
    const [pieData, setPieData] = useState<{ id: number, value: number, label: string}[]>([]);
    const [numberOfTracks, setNumberOfTracks] = useState<number | null>(null);
    const [totalDuration, setTotalDuration] = useState<string | null>(null);

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

    async function getData (playlist_id: string, spotify_id: string) {
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
            calculateFullPlaylistDuration(items);
            let tracks_count = 0;

            for (const item of items) {
                const artists = item.track.artists
                for (const artist of artists) {
                    if (!artists_count[artist.name]){
                        artists_count[artist.name] = 0;
                    }
                    artists_count[artist.name] += 1;
                }
                tracks_count++;
            }

            setNumberOfTracks(tracks_count);
            
            const sorted_artists_count = Object.fromEntries(
                Object.entries(artists_count).sort(([,a],[,b]) => b - a)
            );

            const top_five_artists = Object.fromEntries(
                Object.entries(sorted_artists_count).slice(0, 5)
            );

            const other_artists = Object.fromEntries(
                Object.entries(sorted_artists_count).slice(5, -1)
            );

            let other_artists_count = 0

            for (const [key, value] of Object.entries(other_artists)) {
                other_artists_count += value;
            }

            top_five_artists['Other'] = other_artists_count;

            return top_five_artists;
        } catch (error) {
            console.error('Error getting tracks: ', error);
            return;
        }
    }

    function getPieData() {
        if (!artists) return;
        
        let all_data = [];
        let i = 0;
        for (const [key, value] of Object.entries(artists)) {
            const one_data = { id: i, value: value, label: key};
            all_data.push(one_data);
            i+=1;
        }

        setPieData(all_data);
    }

    function calculateFullPlaylistDuration(items: SpotifyPlaylistItem[]) {
        let ms = 0
        for (const item of items) {
            ms += item.track.duration_ms;
        }

        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);

        setTotalDuration(`${hours}h ${minutes}min`);
        
        return;
    }

    useEffect(() => {
        if (!spotifyId || !playlist_id) return;

        const fetchData = async () => {
            const data = await getData(playlist_id, spotifyId);
            if (data) {
                setArtists(data);
            }
        } 

        fetchData();
    }, [playlist_id, spotifyId]);

    useEffect(() => {
        if (artists) {
            getPieData();
        }
    }, [artists]);
    
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div>
                {totalDuration && (
                    <p>Total duration: {totalDuration}</p>
                )}
            </div>

            <div>
                {numberOfTracks && (
                    <p>Total number of tracks: {numberOfTracks}</p>
                )}
            </div>
            
            <div className="bg-gray-800 shadow-lg rounded-lg p-6 w-1/2 h-1/2 flex items-center justify-center overflow-hidden"> 
                {pieData.length > 0 ? (
                    <PieChart
                        series={[
                            {
                                data: pieData,
                                innerRadius: 25,
                                outerRadius: 90,
                                paddingAngle: 2,
                                cornerRadius: 8,
                                startAngle: 0,
                                endAngle: 360,
                                cx: 150,
                                cy: 90, 
                            }
                        ]}
                        style={{ width: '100%', height: '100%' }} 
                    />
                ) : (
                    <p className="text-gray-400 text-center">Loading data...</p> 
                )}
            </div>
        </div>
    );
}