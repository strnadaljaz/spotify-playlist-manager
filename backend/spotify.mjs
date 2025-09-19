import dotenv from 'dotenv';
import { writeData } from './database.mjs';
dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

export async function getProfile(access_token) {
    let accessToken = access_token;

    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();

    return data;
}

export async function getNewTokens(refreshToken, clientId, clientSecret) {
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
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

export async function getPlaylistsData(user_id, access_token) {
    const response = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        console.error(response.statusText);
    }

    const data = await response.json();

    return data;
}

export async function validateAccessToken(access_token, refresh_token, expires, spotify_id) {
    if (!(Date.now() + 120000 < expires)) {
        const newData = await getNewTokens(refresh_token, clientId, clientSecret);
        access_token = newData.access_token;
        if (newData.refreshToken) {
            refresh_token = newData.refreshToken;
        }
        const expires_in = newData.expires_in;
        const now = Date.now();
        expires = new Date(now + expires_in * 1000);

        await writeData(spotify_id, access_token, refresh_token, expires.toString());
    }

    return access_token;
}

export async function getTracks(playlist_id, access_token) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        console.error(response.statusText);
    }

    const data = await response.json();

    let nextUrl = data.tracks.next;

    if (nextUrl) {
        let allTracks = [...data.tracks.items];
        
        while (nextUrl) {
            const nextResponse = await fetch(nextUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!nextResponse.ok) {
                console.error('Error fetching next page: ', nextResponse.statusText);
                break;
            }

            const nextData = await nextResponse.json();
            allTracks = [...allTracks, ...nextData.items];
            nextUrl = nextData.next;
        }

        data.tracks.items = allTracks
        data.tracks.total = allTracks.length;
        data.tracks.next = null;
    }

    return data;
}