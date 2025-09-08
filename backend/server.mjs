import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { writeData, readData } from './database.mjs';

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

async function getProfile(access_token) {
    let accessToken = access_token;

    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();

    return data;
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
        
        const access_token = data.access_token;
        const refresh_token = data.refresh_token;
        const expires = new Date(data.expires);

        if (Date.now() + 120000 < expires) {
            return res.json({ access_token: access_token });
        }
        // Get new access_token
        else {
            const newData = await getNewTokens(refresh_token, clientID);
            const new_access_token = newData.access_token;
            const new_expires_in = newData.expires_in;
            const now = Date.now();
            const new_expires = new Date(now + new_expires_in * 1000);
            const new_refresh_token = newData.refresh_token;

            await writeData(spotify_id, new_access_token, new_refresh_token, new_expires.toString());

            return res.json({ access_token: new_access_token });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
});

async function getNewTokens(refreshToken, clientId) {
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }),
    }
    const body = await fetch(url, payload);
    const response = await body.json();

    return response;
}

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

// Keep the GET route for direct browser redirects (optional, for debugging)
app.get('/callback', (req, res) => {
    res.json({ 
        message: 'This endpoint expects a POST request from the frontend',
        query: req.query 
    });
});

const PORT = process.env.PORexpiresT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    //console.log('Redirect URI:', redirectURI);
});
