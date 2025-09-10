'use client';

import { useEffect, useState} from "react";
import { useRouter, useParams } from "next/navigation";
import { SpotifyPlaylist, PlaylistTrack } from "../../defines";

export default function PlaylistDetail() {
    const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
    const [tracks, setTracks] = useState<PlaylistTrack[]>([]);

    const params = useParams();
    const playlistId = params.id as string;



    return (
        <div>
            
        </div>
    );
}