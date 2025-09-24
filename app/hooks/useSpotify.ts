import { useState } from "react";
import { SpotifyUserInfo, SpotifyPlaylist, Tracks, SpotifyTrack } from "../dashboard/defines";

export function useSpotify() {

    const [userInfo, setUserInfo] = useState<SpotifyUserInfo | null>(null);
    const [token, setToken] = useState(null);
    const [playlistsData, setPlaylistsData] = useState<SpotifyPlaylist[] | null>(null);
    const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
    const [tracks, setTracks] = useState<Tracks | null>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [artists, setArtists] = useState<{ [key: string]: number } | null>(null);
    const [pieData, setPieData] = useState<{ id: number, value: number, label: string}[]>([]);
    const [numberOfTracks, setNumberOfTracks] = useState<number | null>(null);
    const [totalDuration, setTotalDuration] = useState<string | null>(null);
    const [years, setYears] = useState<{ [key: string]: number } | null>(null);

    return {
        userInfo,
        setUserInfo,
        token,
        setToken,
        playlistsData,
        setPlaylistsData,
        playlist,
        setPlaylist,
        tracks,
        setTracks,
        searchText,
        setSearchText,
        searchResults,
        setSearchResults,
        userId,
        setUserId,
        artists,
        setArtists,
        pieData,
        setPieData,
        numberOfTracks,
        setNumberOfTracks,
        totalDuration,
        setTotalDuration,
        years,
        setYears
    }
}