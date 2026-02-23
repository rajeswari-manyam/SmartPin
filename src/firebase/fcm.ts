import { getMessaging, getToken } from "firebase/messaging";
import { messaging } from "./firebaseConfig";

const projectId  ="parttime-jobs-9b736"
const VAPID_KEY = "BCLEH3gb5nxBrnBTrpGLR_6T-diIFqKUPllDoEQCORGObTa_cH_CEi1mDXO_lCZLdEv9iuZmt68jg8zH5ULFyDw";
export const generateFCMToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BCLEH3gb5nxBrnBTrpGLR_6T-diIFqKUPllDoEQCORGObTa_cH_CEi1mDXO_lCZLdEv9iuZmt68jg8zH5ULFyDw",
    });

    if (token) {
      console.log("✅ FCM Token generated:", token);
      localStorage.setItem("fcmToken", token);
      return token;
    }

    return null;
  } catch (err) {
    console.error("❌ FCM error:", err);
    return null;
  }
};