'use client';

import { useEffect, useState, useCallback} from "react";
import { useRouter, useParams } from "next/navigation";
import { SpotifyPlaylist, Tracks, SpotifyTrack } from "../../defines";
import Image from "next/image";

export default function PlaylistDetail() {
    const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
    const [tracks, setTracks] = useState<Tracks | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
    const router = useRouter();
    
    const [userId, setUserId] = useState<string | null>(null);

    const params = useParams();
    const playlist_id = params.id as string;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://spotify-playlist-manager-backend-atej.onrender.com';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const spotify_id = localStorage.getItem('spotify_id');
            setUserId(spotify_id);

            if (!spotify_id) {
                router.push('/');
                return;
            }

            const getTracks = async () => {

                try {
                    const response = await fetch(`${backendUrl}/getTracks`, {
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
        }
    }, [router, playlist_id]);

    async function removeTrack(track_id: string) {
        if (!userId) {
            console.error('User ID not available');
            return;
        }
        
        const tracksToRemove = { 'tracks': [{'uri': `spotify:track:${track_id}`}] };

        try {
            const response = await fetch(`${backendUrl}/removeTrack`, {
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

            if (tracks) {
                setTracks({
                    ...tracks,
                    items: tracks.items.filter(item => item.track.id !== track_id),
                    total: tracks.total - 1
                });
            }
        } catch (error) {
            console.error('Error removing track:', error);
        }
    }

    // For debugging
    // useEffect(() => {
    //     console.log(tracks);
    //     console.log("playlist: ", playlist);
    // }, [tracks]);

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const search = useCallback(async (search_text: string) => {
        if (!search_text || !userId) {
            console.error("no search text or userID");
            return;
        }
        
        try {
            const response = await fetch(`${backendUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    search_text: search_text,
                    spotify_id: userId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to search:', errorData);
                return;
            }

            const data = await response.json();
            setSearchResults(data.tracks);
        } catch(error) {
            console.error("error submiting search", error);
        }
    }, [userId]);

    useEffect(() => {
        if (searchText.trim()) {
            const timeoutId = setTimeout(() => {
                search(searchText);
            }, 500); // Wait 500ms after user stops typing

            return () => clearTimeout(timeoutId);
        } else {
            setSearchResults([]);
        }
    }, [searchText, search]);

    async function addTrack(track_id: string){
        if (!track_id || !userId || !playlist_id) {
            console.error("something is missing: ", track_id, userId, playlist_id);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/addTrack`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    playlist_id: playlist_id,
                    track_id: track_id,
                    spotify_id: userId
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    console.error('Cant add track. This playlist is not yours!');
                }
                else {
                    const errorData = await response.json();
                    console.error('Failed to add track:', errorData);
                }
                return;
            }

            window.location.reload();
            // Add track to the track list
        } catch (error) {
            console.error("Error submiting add track", error);
        }
    }

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
                            <Image 
                                src={playlist.images[0].url} 
                                alt={`${playlist.name} playlist cover`}
                                width={192}
                                height={192}
                                className="rounded-lg"
                            />
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
                    
                    <div className="mb-6 flex items-center space-x-3 max-w-md">
                        <div className="relative flex-1">
                            
                            <input 
                                type="text" 
                                placeholder="Add tracks..."
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                onChange={(e) => setSearchText(e.target.value)}
                                value={searchText}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            
                        </div>
                        
                    </div>
                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="mb-6 bg-gray-800 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.map((track) => (
                                    <div 
                                        key={track.id}
                                        className="flex items-center space-x-4 p-2 hover:bg-gray-700 rounded cursor-pointer"
                                        onClick={() => addTrack(track.id)}>
                                        <Image
                                            src={track.album.images[2]?.url || "/placeholder-album.png"} 
                                            alt={track.name}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{track.name}</p>
                                            <p className="text-gray-400 text-sm truncate">
                                                {track.artists.map((artist) => artist.name).join(', ')}
                                            </p>
                                        </div>
                                        <span className="text-green-500 text-sm">+ Add</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                        <Image 
                                            src={item.track.album.images[2]?.url || "/placeholder-album.png"} 
                                            alt={item.track.name}
                                            width={48}
                                            height={48}
                                            className="w-12 h-12 rounded"
                                        />
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