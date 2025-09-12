'use client';

import { useEffect, useState} from "react";
import { useRouter, useParams } from "next/navigation";
import { SpotifyPlaylist, PlaylistTrack, Tracks } from "../../defines";

export default function PlaylistDetail() {
    const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
    const [tracks, setTracks] = useState<Tracks | null>(null);
    const router = useRouter();
    
    const userId = localStorage.getItem('spotify_id');

    const params = useParams();
    const playlist_id = params.id as string;

    async function removeTrack(track_id: string) {
        const tracksToRemove = { 'tracks': [{'uri': `spotify:track:${track_id}`}] };

        try {
            const response = await fetch("http://127.0.0.1:3001/removeTrack", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify ({
                    playlist_id: playlist_id,
                    tracks: tracksToRemove,
                    user_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to remove track:', errorData);
                return;
            }

            window.location.reload();
        } catch (error) {
            console.error('Error removing track:', error);
        }
    }

    useEffect(() => {
        const spotify_id = localStorage.getItem('spotify_id');

        const getTracks = async () => {
            if (!spotify_id) {
                router.push('/');
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:3001/getTracks", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ playlist_id, spotify_id })
                });

                if (!response.ok) {
                    router.push('/');
                    return;
                }

                const data = await response.json();
                setTracks(data.tracks.tracks);
                setPlaylist(data.tracks);
            } catch (error) {
                console.error('Error getting tracks:" ', error);
                router.push('/');
            }
        }

        getTracks();
    }, [router, playlist_id]);

    useEffect(() => {
        console.log(tracks);
        //console.log("playlist: ", playlist);
    }, [tracks]);

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!tracks || !playlist) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading tracks...</p>
            </div>
          </div>  
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-b from-green-800 to-green-900 p-8">
                <button 
                    onClick={() => router.back()}
                    className="mb-4 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    ← Back to Playlists
                </button>
                <div className="flex items-center space-x-6">
                    <div className="w-48 h-48 bg-gray-700 rounded-lg shadow-2xl flex items-center justify-center">
                        <div className="text-6xl">
                            <img src={playlist.images[0].url} alt="" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-300 mb-2">Playlist</p>
                        <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
                        <h2>{playlist.description}</h2>
                        <p className="text-gray-300">{tracks.total} songs</p>
                    </div>
                </div>
            </div>

            {/* Tracks List */}
            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-13 gap-4 px-6 py-3 text-gray-400 text-sm border-b border-gray-700 mb-4">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">Title</div>
                        <div className="col-span-3">Album</div>
                        <div className="col-span-2 text-right">Duration</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Track Items */}
                    <div className="space-y-1">
                        {tracks.items.map((item, index) => (
                            <div 
                                key={item.track.id}
                                className="grid grid-cols-13 gap-4 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors group"
                            >
                                {/* Track Number */}
                                <div className="col-span-1 flex items-center">
                                    <span className="text-gray-400 text-sm group-hover:hidden">
                                        {index + 1}
                                    </span>
                                    <button className="hidden group-hover:block text-white hover:text-green-500 cursor-pointer">
                                        ▶
                                    </button>
                                </div>

                                {/* Title and Artist */}
                                <div className="col-span-6 flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                                        <span className="text-gray-400 text-xl"><img src={item.track.album.images[2].url} alt="" /></span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {item.track.name}
                                        </p>
                                        <p className="text-gray-400 text-sm truncate">
                                            {item.track.artists.map(artist => artist.name).join(', ')}
                                        </p>
                                    </div>
                                </div>

                                {/* Album */}
                                <div className="col-span-3 flex items-center">
                                    <p className="text-gray-400 text-sm truncate">
                                        {item.track.album.name}
                                    </p>
                                </div>

                                {/* Duration */}
                                <div className="col-span-2 flex items-center justify-end">
                                    <span className="text-gray-400 text-sm">
                                        {formatDuration(item.track.duration_ms)}
                                    </span>
                                </div>

                                {/* Delete Button */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <div
                                        className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                                        onClick={() => removeTrack(item.track.id)}
                                    >
                                        x
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* Empty state */}
                    {tracks.items.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🎵</div>
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">No tracks found</h3>
                            <p className="text-gray-500">This playlist appears to be empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}