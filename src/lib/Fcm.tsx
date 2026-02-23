import React, { useEffect, useState } from "react";
import { messaging } from "../firebase/firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const VAPID_KEY = "BCLEH3gb5nxBrnBTrpGLR_6T-diIFqKUPllDoEQCORGObTa_cH_CEi1mDXO_lCZLdEv9iuZmt68jg8zH5ULFyDw";

const FCMToken: React.FC = () => {
    const [token, setToken] = useState("");

    useEffect(() => {
        generateToken();

        onMessage(messaging, (payload) => {
            console.log("📩 Foreground message:", payload);
            alert(payload.notification?.title);
        });
    }, []);

    const generateToken = async () => {
        try {
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                console.log("❌ Notification permission denied");
                return;
            }

            const currentToken = await getToken(messaging, {
                vapidKey: "BCLEH3gb5nxBrnBTrpGLR_6T-diIFqKUPllDoEQCORGObTa_cH_CEi1mDXO_lCZLdEv9iuZmt68jg8zH5ULFyDw",
            });

            if (!currentToken) {
                console.log("❌ No FCM token generated");
                return;
            }

            console.log("✅ FCM Token:", currentToken);
            setToken(currentToken);

            // Send token to backend
            await axios.post("http://192.168.1.48:5000/save-token", {
                token: currentToken,
                userId: "123",
            });
        } catch (error) {
            console.error("❌ FCM error:", error);
        }
    };

    return (
        <div>
            <h3>Your FCM Token</h3>
            <textarea
                value={token}
                readOnly
                rows={5}
                style={{ width: "100%" }}
            />
        </div>
    );
};

export default FCMToken;