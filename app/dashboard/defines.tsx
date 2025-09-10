export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
    id: string;
  };
}

export interface SpotifyUserInfo {
  display_name: string;
  id: string;
  email?: string;
}

export interface PlaylistTrack {
  track: {
    id:string;
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string};
    duration_ms: number;
  };
}