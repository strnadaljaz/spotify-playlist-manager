# Spotify Playlist Manager

A minimal full-stack application project for authenticating with Spotify, browsing a user's playlists, and viewing tracks inside each playlist.

Frontend will be deployed on Vercel (Next.js App Router). Backend (Express) will run as a separate service (e.g. Render) acting as a secure proxy for the Spotify Web API and handling token refresh & persistence (Firebase Realtime Database).

## Features
- Spotify OAuth Authorization Code Flow via backend proxy ([`getAuthorizationUrl`](backend/server.mjs))
- Token storage + auto refresh ([`checkAccessToken`](backend/spotify.mjs))
- Playlist listing ([`/getPlaylistsData`](backend/server.mjs) calling [`getPlaylistsData`](backend/spotify.mjs))
- Track listing per playlist ([`/getTracks`](backend/server.mjs) calling [`getTracks`](backend/spotify.mjs))
- Strict separation: browser only stores a `spotify_id`, never access/refresh tokens
- Typed frontend models ([`app/dashboard/defines.tsx`](app/dashboard/defines.tsx))

## High-Level Flow
1. User clicks "Login with Spotify" on the Home page ([`app/page.tsx`](app/page.tsx)); frontend requests backend endpoint [`/getAuthorizationUrl`](backend/server.mjs).
2. User is redirected to Spotify, approves scopes, returns to callback page ([`app/callback/page.tsx`](app/callback/page.tsx)).
3. Callback page posts `code` to backend [`/callback`](backend/server.mjs); backend:
   - Exchanges code for tokens.
   - Fetches profile via [`getProfile`](backend/spotify.mjs).
   - Persists tokens with [`writeData`](backend/database.mjs).
   - Returns `spotify_id` to frontend.
4. Frontend stores `spotify_id` and loads dashboard ([`app/dashboard/page.tsx`](app/dashboard/page.tsx)).
5. Dashboard requests `/getAccessToken` (refresh logic via [`checkAccessToken`](backend/spotify.mjs)), then playlists via `/getPlaylistsData`.
6. Selecting a playlist navigates to detail view ([`app/dashboard/playlist/[id]/page.tsx`](app/dashboard/playlist/[id]/page.tsx)) which calls `/getTracks`.

## Backend Endpoints
- `POST /getAuthorizationUrl` → Build auth URL ([`getAuthorizationUrl`](backend/server.mjs))
- `POST /callback` → Exchange code, store tokens ([`getProfile`](backend/spotify.mjs), [`writeData`](backend/database.mjs))
- `POST /getAccessToken` → Return (possibly refreshed) access token ([`checkAccessToken`](backend/spotify.mjs))
- `POST /getPlaylistsData` → Return playlists ([`getPlaylistsData`](backend/spotify.mjs))
- `POST /getTracks` → Return playlist tracks ([`getTracks`](backend/spotify.mjs))

## Frontend Pages
- Home: login launcher ([`app/page.tsx`](app/page.tsx))
- OAuth Callback handler: ([`app/callback/page.tsx`](app/callback/page.tsx))
- Dashboard: playlists grid ([`app/dashboard/page.tsx`](app/dashboard/page.tsx))
- Playlist detail & track table: ([`app/dashboard/playlist/[id]/page.tsx`](app/dashboard/playlist/[id]/page.tsx))
- Root layout & global styling: ([`app/layout.tsx`](app/layout.tsx), [`app/globals.css`](app/globals.css))

## Data Models
Defined in [`app/dashboard/defines.tsx`](app/dashboard/defines.tsx):
- `SpotifyPlaylist`
- `SpotifyUserInfo`
- `PlaylistTrack`
- `Tracks`

## Token Lifecycle
Access tokens are renewed just-in-time:
- Expiry checked in [`checkAccessToken`](backend/spotify.mjs)
- On refresh, new values persisted with [`writeData`](backend/database.mjs)
- Frontend never sees refresh tokens; only requests a short-lived access token through `/getAccessToken`

## Persistence Layer
Firebase Realtime Database wrapper:
- Write: [`writeData`](backend/database.mjs)
- Read: [`readData`](backend/database.mjs)

## Architecture Summary
- Frontend: Next.js UI + fetch calls to backend
- Backend: Express API → Spotify Web API
- Storage: Firebase for tokens (per `spotify_id`)

## Security Notes
- Refresh tokens never leave backend
- Consider rotating CSRF `state` per auth request
- Add PKCE for enhanced security (supported by Spotify)