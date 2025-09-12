import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);

export function writeData(spotify_id, access_token, refresh_token, expires) {
    const db = getDatabase();
    set(ref(db, 'users/' + spotify_id), {
        access_token: access_token,
        refresh_token: refresh_token,
        expires : expires
    });
}

export async function readData(user_id) {
    const dbRef = ref(getDatabase());
    try {
        const snapshot = await get(child(dbRef, `users/${user_id}`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}