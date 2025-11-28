import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { writeData, readData } from './database.mjs';
import { getProfile, getPlaylistsData, getTracks, validateAccessToken } from './spotify.mjs';

dotenv.config();
const app = express();

app.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://spotimanager.vercel.app'], 
}));

app.use(express.json());

const clientID = process.env.CLIENT_ID;
const clientSecret = praocess.env.CLIENT_SECRET;

const redirectURI = process.env.REDIRECT_URI || 'http://127.0.0.1:3000/callback'; 
const AuthLink = 'https://accounts.spotify.com/authorize?';
const scope = 'playlist-read-private playlist-modify-public playlist-modify-private';
const state = Math.random().toString(36).substring(2, 15);

// Function for handling error responses
const sendErrorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({ error: message});
}

const validateSpotifyId = (spotify_id) => {
    if (!spotify_id) {
        throw new Error('Spotify id is required');
    }
}

function getAuthorizationUrl() {
    const url = AuthLink + new URLSearchParams({
        response_type: 'code',
        client_id: clientID,
        scope: scope,
        redirect_uri: redirectURI,
        state: state
    });

    return url;
}

app.post('/getAuthorizationUrl', (req, res) => {
    res.json(getAuthorizationUrl());
});

// Handle token exchange 
app.post('/callback', async (req, res) => {
    const { code } = req.body;

    try {
        if (!code) {
            return sendErrorResponse(res, 400, 'No authorization code provided');
        }

        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectURI
            })
        });

        const tokenData = await tokenResponse.json();
        const access_token = tokenData.access_token;
        const refresh_token = tokenData.refresh_token;
        const expires_in = tokenData.expires_in;
        const now = Date.now();
        const expires = new Date(now + expires_in * 1000);

        const profileData = await getProfile(access_token);

        const spotify_id = profileData.id;

        writeData(spotify_id, access_token, refresh_token, expires.toString());

        if (tokenData.error) {
            return sendErrorResponse(res, 400, tokenData.error)
        }

        res.json({
            spotify_id: spotify_id,
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in: expires_in
        });
    } catch (error) {
        console.error('Token exchange error:', error);
        return sendErrorResponse(res, 500, 'Server error during token exchange');
    }
});

app.post('/getAccessToken', async (req, res) => {
    try {
        const { spotify_id } = req.body;
        validateSpotifyId(spotify_id);

        const data = await readData(spotify_id);
        if (!data) {
            return sendErrorResponse(res, 404, 'User not found')
        }
        
        const access_token = await validateAccessToken(data.access_token, data.refresh_token, new Date(data.expires), spotify_id);

        return res.json({ access_token });
        
    } catch (error) {
        console.error('Database error:', error);
        return sendErrorResponse(res, 500, 'Database error');
    }
});

app.post('/getPlaylistsData', async (req, res) => {
    const { spotify_id } = req.body;
    try {
        validateSpotifyId(spotify_id);
        
        const data = await readData(spotify_id);

        if (!data) {
            return sendErrorResponse(res, 404, 'User not found')
        }

        const access_token = await validateAccessToken(data.access_token, data.refresh_token, new Date(data.expires), spotify_id);

        const playlists_data = await getPlaylistsData(spotify_id, access_token);

        return res.json({ playlists_data });
    } catch (error) {
        console.error('Error in getPlaylistsData: ', error);
        return sendErrorResponse(res, 500, 'Server error');
    }

});

app.post('/getTracks', async (req, res) => {
    const { playlist_id, spotify_id } = req.body;

    try {
        if (!playlist_id) {
            return sendErrorResponse(res, 400, 'No playlist id')
        }

        if (!spotify_id) {
            return sendErrorResponse(res, 400, 'No spotify id')
        }

        const data = await readData(spotify_id);
        
        if (!data) {
            return sendErrorResponse(res, 404, 'User not found');
        }
        
        const access_token = await validateAccessToken(data.access_token, data.refresh_token, new Date(data.expires), spotify_id);

        const tracks = await getTracks(playlist_id, access_token);

        res.json({tracks: tracks});
    } catch (error) {
        console.error('Error in getTracks:', error);
        return sendErrorResponse(res, 500, 'Server error')
    }
});

app.post('/removeTrack', async (req, res) => {
    const { playlist_id, tracks, spotify_id } = req.body;
  
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;

    try {
        if (!playlist_id) {
            return sendErrorResponse(res, 400, "No playlist id");
        }
        if (!tracks) {
            return sendErrorResponse(res, 400, "No tracks");
        }
        if (!spotify_id) {
            return sendErrorResponse(res, 400, "No spotify id");
        }

        const data = await readData(spotify_id);
        
        if (!data) {
            return sendErrorResponse(res, 404, "User not found");
        }

        const access_token = await validateAccessToken(data.access_token, data.refresh_token, new Date(data.expires), spotify_id);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tracks)
        });

        if (!response.ok) {
            console.error(response.message);
        }
        
        return res.status(200).json({ success: true, message: 'Track removed successfully' });
    } catch (error) {
        console.error("Error removing the track: ", error);
        return sendErrorResponse(res, 500, 'server error');
    }
});

app.post('/search', async (req, res) => {
    const { search_text, spotify_id } = req.body;

    try {
        if (!search_text) {
          return sendErrorResponse(res, 400, 'Search text is required');
        }

        if (!spotify_id) {
            return sendErrorResponse(res, 400, 'Spotify id is required');
        }

        const data = await readData(spotify_id);

        if (!data) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const access_token = await validateAccessToken(data.access_token, data.refresh_token, new Date(data.expires), spotify_id);

        console.log(access_token);

        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(search_text)}&type=track&limit=20`;

        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Spotify API error:', response.status, response.statusText);
            return sendErrorResponse(res, response.status, 'Spotify API error');
        }

        const searchResults = await response.json();

        res.json({
            tracks: searchResults.tracks.items
        });
    } catch (error) {
        console.error('Error in search:', error);
        return sendErrorResponse(res, 500, 'Server error')
    }
});

app.post('/addTrack', async (req, res) => {
    const { playlist_id, track_id, spotify_id } = req.body;

    try {
        if (!playlist_id) {
            return sendErrorResponse(res, 400, 'no playlist id');
        }

        if (!spotify_id) {            
            return sendErrorResponse(res, 400, 'no spotify id');
        }

        if (!track_id) {
            return sendErrorResponse(res, 400, 'no track id');
        }

        const data = await readData(spotify_id);
        if (!data) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const access_token = await validateAccessToken(data.access_token, data.refresh_token, new Date(data.expires), spotify_id);

        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({
                uris: [`spotify:track:${track_id}`]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return sendErrorResponse(res, response.status, errorData)
        }

        return res.status(200).json({ success: true, message: 'Track added successfully' });
    } catch (error) {
        console.error('Error adding track: ', error);
        return sendErrorResponse(res, 500, 'Server error');
    }
});

const PORT = process.env.PORexpiresT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});