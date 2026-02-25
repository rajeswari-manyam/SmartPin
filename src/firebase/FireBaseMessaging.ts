// src/firebase/firebaseMessaging.ts
import { getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

// Get your VAPID key from:
// Firebase Console → Project Settings → Cloud Messaging
// → Web Push certificates → Generate key pair → copy Public key
const VAPID_KEY = "BCLEH3gb5nxBrnBTrpGLR_6T-diIFqKUPllDoEQCORGObTa_cH_CEi1mDXO_lCZLdEv9iuZmt68jg8zH5ULFyDw";

export const generateFCMToken = async (): Promise<string | null> => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("❌ Notification permission denied");
            return null;
        }

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (token) {
            console.log("✅ FCM Token generated:", token);
            localStorage.setItem("fcmToken", token);
            return token;
        }

        console.warn("⚠️ FCM token not returned");
        return null;
    } catch (err) {
        console.error("❌ FCM generateToken error:", err);
        return null;
    }
};