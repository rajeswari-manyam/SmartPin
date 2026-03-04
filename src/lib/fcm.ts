import { getMessaging, getToken } from "firebase/messaging";
import { app } from "../firebase";

export async function getFcmToken() {
    try {
        const messaging = getMessaging(app);
        // VAPID key must be set in your Firebase project settings
        const vapidKey = "BCLEH3gb5nxBrnBTrpGLR_6T-diIFqKUPllDoEQCORGObTa_cH_CEi1mDXO_lCZLdEv9iuZmt68jg8zH5ULFyDw";
        const currentToken = await getToken(messaging, { vapidKey });
        if (currentToken) {
            return currentToken;
        } else {
            console.warn("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (err) {
        console.error("An error occurred while retrieving FCM token:", err);
        return null;
    }
}




