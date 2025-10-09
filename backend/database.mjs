import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";
// For encryption and decryption
import ncrypt from 'ncrypt-js';
dotenv.config();
let secretKey = process.env.SECRET_KEY;
let ncryptObject = new ncrypt(secretKey);

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

function encryptData(access_token, refresh_token, expires) {
    let enc_access_token = ncryptObject.encrypt(access_token);
    let enc_refresh_token = ncryptObject.encrypt(refresh_token);
    let enc_expires = ncryptObject.encrypt(expires);

    return { enc_access_token, enc_refresh_token, enc_expires };
}

function decryptData(access_token, refresh_token, expires) {
    let dec_access_token = ncryptObject.decrypt(access_token);
    let dec_refresh_token = ncryptObject.decrypt(refresh_token);
    let dec_expires = ncryptObject.decrypt(expires);
}

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