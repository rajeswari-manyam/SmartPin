// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseConfig = {
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional

//   apiKey: "AIzaSyC3CWgbVMX4ITNzQ5D0ZGfsmLpImAFupLI",
//   authDomain: "parttime-jobs-9b736.firebaseapp.com",
//   projectId: "parttime-jobs-9b736",
//   storageBucket: "parttime-jobs-9b736.firebasestorage.app",
//   messagingSenderId: "234889445653",
//   appId: "1:234889445653:web:bdf44e3270c35c3b71a91c",
//   measurementId: "G-11GDDTHRRL"
// };
// const app = initializeApp(firebaseConfig);

// export const messaging = getMessaging(app);

// // OPTIONAL: foreground listener
// export const listenForMessages = () =>
//     onMessage(messaging, (payload) => {
//         console.log("📩 Foreground message:", payload);
//     });


// src/firebase/firebaseConfig.ts
import { initializeApp }                         from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

const firebaseConfig = {
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

// ── Foreground listener (app is open) ────────────────────────────
// Returns an unsubscribe function — call it in useEffect cleanup
export const listenForMessages = () =>
    onMessage(messaging, (payload) => {
        console.log("📩 Foreground message:", payload);
    });

// ── Used by NotificationToast to attach its own handler ──────────
export const onForegroundMessage = (
    callback: (payload: MessagePayload) => void
): (() => void) => {
    return onMessage(messaging, callback);
};