const express = require('express');
require('dotenv').config({ path: './backend/.env' }); // Fix: Remove 'backend/' since you're running from backend directory
const cors = require('cors');
const admin = require('firebase-admin');
const { access } = require('fs');

admin.initializeApp();
const db = admin.firestore();

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:3000',
}));

app.use(express.json());

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const redirectURI = process.env.REDIRECT_URI || 'http://127.0.0.1:3001/callback'; 
const AuthLink = 'https://accounts.spotify.com/authorize?';
const scope = 'playlist-read-private playlist-modify-public playlist-modify-private';
const state = Math.random().toString(36).substring(2, 15);

function getAuthorizationUrl() 
{
    const url = AuthLink + new URLSearchParams({
        response_type: 'code',
        client_id: clientID,
        scope: scope,
        redirect_uri: redirectURI,
        state: state
    });

    return url;
}

app.get('/getAuthorizationUrl', (req, res) => {
    res.json(getAuthorizationUrl());
});

app.get('/callback', async (req, res) => {
    const { code, state: returnedState } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No authorization code provided' });
    }

    try {
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Fix: Correct case
                'Authorization': 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64') // Fix: Use correct variable names and remove 'new'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectURI
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res.status(400).json({ error: tokenData.error });
        }

        const access_token = tokenData.access_token;
        const refresh_token = tokenData.refresh_token;
        const expires_in = tokenData.expires_in;

        res.json({
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in: expires_in
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    //console.log('Redirect URI:', redirectURI); // Debug log
    console.log(clientID);
});