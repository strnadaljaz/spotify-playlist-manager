import dotenv from 'dotenv';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, child, get } from "firebase/database";
import { access } from 'fs';
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
    const enc_access_token = ncryptObject.encrypt(access_token);
    const enc_refresh_token = ncryptObject.encrypt(refresh_token);
    const enc_expires = ncryptObject.encrypt(expires);

    return { enc_access_token, enc_refresh_token, enc_expires };
}

function decryptData(access_token, refresh_token, expires) {
    const dec_access_token = ncryptObject.decrypt(access_token);
    const dec_refresh_token = ncryptObject.decrypt(refresh_token);
    const dec_expires = ncryptObject.decrypt(expires);

    return { dec_access_token, dec_refresh_token, dec_expires };
}

export function writeData(spotify_id, access_token, refresh_token, expires) {
    const db = getDatabase();

    const { enc_access_token, enc_refresh_token, enc_expires } = encryptData(access_token, refresh_token, expires);

    set(ref(db, 'users/' + spotify_id), {
        access_token: enc_access_token,
        refresh_token: enc_refresh_token,
        expires : enc_expires
    });
}

export async function readData(user_id) {
    const dbRef = ref(getDatabase());
    try {
        const snapshot = await get(child(dbRef, `users/${user_id}`));
        if (snapshot.exists()) {
            const encryptedData =  snapshot.val();

            const { dec_access_token, dec_refresh_token, dec_expires } = decryptData(
                encryptedData.access_token,
                encryptedData.refresh_token,
                encryptedData.expires
            );

            return {
                access_token: dec_access_token,
                refresh_token: dec_refresh_token,
                expires: dec_expires
            };
        } else {
            console.log("No data available");
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}