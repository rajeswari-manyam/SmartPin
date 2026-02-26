// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyC3CWgbVMX4ITNzQ5D0ZGfsmLpImAFupLI",
    authDomain: "parttime-jobs-9b736.firebaseapp.com",
    projectId: "parttime-jobs-9b736",
    storageBucket: "parttime-jobs-9b736.firebasestorage.app",
    messagingSenderId: "234889445653",
    appId: "1:234889445653:web:bdf44e3270c35c3b71a91c",
    measurementId: "G-11GDDTHRRL"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const messaging = getMessaging(app);