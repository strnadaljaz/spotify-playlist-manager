# Spotify Playlist Manager

> A modern full-stack web application that seamlessly integrates with Spotify's API to provide an intuitive interface for managing your music playlists.

![App Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌐 Live Demo
**App URL**: [https://spotimanager.vercel.app](https://spotimanager.vercel.app)

<!-- Add screenshots/GIF here -->
## 📸 Screenshots & Demo

### 🎥 Live Demo
![Spotify Playlist Manager Demo](docs/demo/app-demo.gif)

*Watch the app in action: OAuth login, playlist browsing, and responsive design*

## 📋 Project Description

Spotify Playlist Manager is a comprehensive web application that bridges the gap between Spotify's native interface and enhanced playlist management capabilities. Users can authenticate securely through Spotify OAuth, browse their personal playlists, and manage tracks with an intuitive, responsive interface.

The application focuses on providing a clean, efficient user experience while maintaining secure access to Spotify data through proper authentication and token management.

## ✨ Features

### Current Features
- 🔐 **Secure Spotify OAuth 2.0 Authentication**
- 📂 **Browse Personal Playlists** - View all your Spotify playlists
- 🎵 **Track Management** - View and explore tracks within playlists
- 🔒 **Secure Token Management** - Automatic token refresh and secure storage
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

### Planned Features
- ✏️ Edit playlist details (name, description)
- ➕ Add/remove tracks from playlists
- 🔍 Advanced search and filtering
- 📊 Playlist analytics and insights
- 🎯 Smart playlist recommendations

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS / CSS Modules
- **TypeScript**: For type safety
- **State Management**: React Context / Zustand

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Spotify OAuth 2.0
- **API**: RESTful endpoints

### Database & Storage
- **Database**: Firebase Realtime Database
- **Session Storage**: Secure token management
- **Deployment**: Vercel (Frontend), Render (Backend)

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **API Testing**: Postman/Thunder Client

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│  Express API    │───▶│  Spotify API    │
│   (Frontend)    │    │   (Backend)     │    │   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       ▼                       
         │              ┌─────────────────┐              
         └─────────────▶│ Firebase RTDB   │              
                        │   (Database)    │              
                        └─────────────────┘              
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Spotify Developer Account
- Firebase Project

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/spotify-playlist-manager.git
cd spotify-playlist-manager
```

### 2. Install Dependencies

**Frontend:**
```bash
cd app
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Environment Setup

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
```

**Backend (.env):**
```env
PORT=3001
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

### 4. Spotify App Configuration
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/callback`
4. Note your Client ID and Client Secret

### 5. Firebase Setup
1. Create a Firebase project
2. Enable Realtime Database
3. Generate service account credentials
4. Add credentials to environment variables

### 6. Run the Application

**Start Backend:**
```bash
cd backend
node server.mjs
```

**Start Frontend:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

## � Testing


This project uses **Jest** and **React Testing Library** for unit and integration testing of the frontend. Backend tests can be added as needed.

> **Note:** You must create your own `babel.config.js` file before running tests. This file is not included in the repository (to avoid Vercel deployment issues). Without it, tests will not work. See the example below:

```js
// babel.config.js
module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
```

### Running Tests

To run all tests:

```bash
npm test
```

Or, for more detailed output:

```bash
npm run test:watch
```

- Frontend tests are located in the `__tests__/frontend/` directory and cover React components and pages.
- Test files use the `.test.tsx` or `.test.ts` naming convention.
- You can run tests for a specific file by passing its path to the test command.

### Adding Tests

- Place new test files in the appropriate `__tests__` subdirectory.
- Use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) best practices for writing tests.
- Ensure your code is covered by tests before submitting a pull request.

## �🧠 What I Learned & Challenges Solved

### Key Learning Points

**🔐 OAuth 2.0 Implementation**
- Implemented secure Spotify OAuth flow with PKCE
- Managed access tokens and refresh tokens securely
- Handled token expiration and automatic refresh

**⚡ API Rate Limiting & Optimization**
- Implemented request queuing to respect Spotify's rate limits
- Added caching strategies to reduce API calls
- Optimized data fetching with pagination

**🏗 Full-Stack Architecture**
- Designed RESTful API endpoints with proper error handling
- Implemented secure communication between frontend and backend
- Managed state synchronization across components

**🔒 Security Best Practices**
- Secure token storage and transmission
- Environment variable management
- CORS configuration and API security

### Challenges Overcome

1. **Token Management**: Implementing automatic token refresh without interrupting user experience
2. **API Rate Limits**: Designing efficient request patterns to stay within Spotify's limits
3. **Real-time Updates**: Synchronizing playlist changes across the application
4. **Error Handling**: Creating robust error handling for various API failure scenarios

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for providing comprehensive music data
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for reliable backend services

---

**⭐ If you found this project helpful, please give it a star!**