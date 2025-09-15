// Napisi funkcijo za pridobivanje novega access tokena

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { writeData, readData } from './database.mjs';
import { getProfile, getPlaylistsData, getTracks, checkAccessToken } from './spotify.mjs';
import { captureOwnerStack } from 'react';

dotenv.config();
const app = express();

app.use(cors({
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'], 
}));

app.use(express.json());

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const redirectURI = process.env.REDIRECT_URI || 'http://127.0.0.1:3000/callback'; 
const AuthLink = 'https://accounts.spotify.com/authorize?';
const scope = 'playlist-read-private playlist-modify-public playlist-modify-private';
const state = Math.random().toString(36).substring(2, 15);

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

app.post('/getAccessToken', async (req, res) => {
    const { spotify_id } = req.body;
    
    if (!spotify_id) {
        return res.status(400).json({ error: 'spotify_id is required' });
    }
    
    try {
        const data = await readData(spotify_id);
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let access_token = data.access_token;
        const refresh_token = data.refresh_token;
        const expires = new Date(data.expires);

        access_token = await checkAccessToken(access_token, refresh_token, expires, spotify_id);

        return res.json({ access_token: access_token });
        
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
});

app.post('/getPlaylistsData', async (req, res) => {
    const { spotify_id } = req.body;

    if (!spotify_id) {
        return res.status(400).json({ error: 'spotify_id is required' });
    }
    try {
        const data = await readData(spotify_id);

        if (!data) {
            return res.status(404).json({ error: 'spotify_id is required' });
        }

        let access_token = data.access_token;
        const refresh_token = data.refresh_token;
        const expires = new Date(data.expires);

        access_token = await checkAccessToken(access_token, refresh_token, expires, spotify_id);

        const playlists_data = await getPlaylistsData(spotify_id, access_token);

        return res.json({ playlists_data });
    } catch (error) {
        console.error('Error in getPlaylistsData: ', error);
        return res.status(500).json({ error: 'Server error' });
    }

});

// Handle token exchange - this is what your frontend calls
app.post('/callback', async (req, res) => {
    const { code, state: returnedState } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
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
            return res.status(400).json({ error: tokenData.error });
        }

        res.json({
            spotify_id: spotify_id,
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in: expires_in
        });
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Server error during token exchange' });
    }
});

app.post('/getTracks', async (req, res) => {
    const { playlist_id, spotify_id } = req.body;

    if (!playlist_id) {
        return res.status(400).json({ error: 'No playlist id' });
    }

    if (!spotify_id) {
        return res.status(400).json({ error: 'No spotify id' });
    }

    try {
        const data = await readData(spotify_id);
        
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let access_token = data.access_token;
        const refresh_token = data.refresh_token;
        const expires = new Date(data.expires);

        access_token = await checkAccessToken(access_token, refresh_token, expires, spotify_id);

        const tracks = await getTracks(playlist_id, access_token);

        res.json({tracks: tracks});
    } catch (error) {
        console.error('Error in getTracks:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.post('/removeTrack', async (req, res) => {
    const { playlist_id, tracks, user_id } = req.body;

    if (!playlist_id) {
        return res.status(400).json({ error: "No playlist id" });
    }

    if (!tracks) {
        return res.status(400).json({ error: "No tracks" });
    }

    if (!user_id) {
        return res.status(400).json({ error: 'No user id' });
    }
    
    const url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;

    try {
        const data = await readData(user_id);
        
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        const refresh_token = data.refresh_token;
        const expires = new Date(data.expires);
        const access_token = await checkAccessToken(data.access_token, refresh_token, expires);

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
        return res.status(500).json({ error: 'server error' });
    }
});

app.post('/search', async (req, res) => {
    const { search_text, spotify_id } = req.body;

    if (!search_text) {
        return res.status(400).json({ error: 'Search text is required' });
    }

    if (!spotify_id) {
        return res.status(400).json({ error: 'Spotify id is required' });
    }

    try {
        const data = await readData(spotify_id);

        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        let access_token = data.access_token;
        const refresh_token = data.refresh_token;
        const expires = new Date(data.expires);

        access_token = await checkAccessToken(access_token, refresh_token, expires, spotify_id);

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
            return res.status(response.status).json({ error: 'Spotify API error' });
        }

        const searchResults = await response.json();

        res.json({
            tracks: searchResults.tracks.items
        });
    } catch (error) {
        console.error('Error in search:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORexpiresT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    //console.log('Redirect URI:', redirectURI);
});