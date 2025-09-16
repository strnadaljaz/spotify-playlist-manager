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
    id: string;
    name: string;
    artists: Array<{ 
      name: string;
      id: string;
    }>;
    album: {
      name: string;
      images: Array<{
        url: string;
        height: number | null;
        width: number | null;
      }>;
    };
    duration_ms: number;
  };
}

export interface Tracks {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: Array<PlaylistTrack>;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string; id: string }>;
    album: {
        name: string;
        images: Array<{
            url: string;
            height: number | null;
            width: number | null;
        }>;
    };
    duration_ms: number;
}