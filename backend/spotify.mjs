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