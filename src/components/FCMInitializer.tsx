// import React, { useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useAccount } from "../context/AccountContext";
// import { generateFCMToken } from "../lib/fcm";
// import { saveFcmToken } from "../services/api.service";

// const FCMInitializer: React.FC = () => {
//     const { user, isAuthenticated } = useAuth();
//     const { workerProfileId } = useAccount();

//     // ── Generate token ONCE ────────────────────────────────────────
//     useEffect(() => {
//         if (!isAuthenticated || !user?._id) return;

//         const initToken = async () => {
//             let token = localStorage.getItem("fcmToken");

//             if (!token) {
//                 token = await generateFCMToken();
//                 if (!token) return;
//                 localStorage.setItem("fcmToken", token);
//             }

//             // Save for User
//             if (!localStorage.getItem("fcmSaved_user")) {
//                 await saveFcmToken(user._id, "User", token);
//                 localStorage.setItem("fcmSaved_user", "true");
//                 console.log("🔔 FCM saved for User:", user._id);
//             }

//             // Save for Worker (if exists)
//             const workerId =
//                 workerProfileId || localStorage.getItem("workerId");

//             if (workerId && !localStorage.getItem("fcmSaved_worker")) {
//                 await saveFcmToken(workerId, "Worker", token);
//                 localStorage.setItem("fcmSaved_worker", "true");
//                 console.log("🔔 FCM saved for Worker:", workerId);
//             }
//         };

//         initToken();
//     }, [isAuthenticated, user?._id, workerProfileId]);

//     // ── When worker profile created later ──────────────────────────
//     useEffect(() => {
//         if (!workerProfileId || !isAuthenticated) return;
//         if (localStorage.getItem("fcmSaved_worker")) return;

//         const token = localStorage.getItem("fcmToken");
//         if (!token) return;

//         saveFcmToken(workerProfileId, "Worker", token)
//             .then(() => {
//                 localStorage.setItem("fcmSaved_worker", "true");
//                 console.log(
//                     "🔔 FCM saved for new Worker profile:",
//                     workerProfileId
//                 );
//             })
//             .catch(() =>
//                 console.warn("⚠️ Failed saving FCM for Worker")
//             );
//     }, [workerProfileId, isAuthenticated]);

//     return null;
// };

// export default FCMInitializer;
export default {};
