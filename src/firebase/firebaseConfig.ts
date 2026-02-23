import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

  apiKey: "AIzaSyC3CWgbVMX4ITNzQ5D0ZGfsmLpImAFupLI",
  authDomain: "parttime-jobs-9b736.firebaseapp.com",
  projectId: "parttime-jobs-9b736",
  storageBucket: "parttime-jobs-9b736.firebasestorage.app",
  messagingSenderId: "234889445653",
  appId: "1:234889445653:web:bdf44e3270c35c3b71a91c",
  measurementId: "G-11GDDTHRRL"
};
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

// OPTIONAL: foreground listener
export const listenForMessages = () =>
    onMessage(messaging, (payload) => {
        console.log("📩 Foreground message:", payload);
    });