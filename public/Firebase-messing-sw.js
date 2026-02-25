/* public/firebase-messaging-sw.js
   ──────────────────────────────────────────────────────────────────
   IMPORTANT: This file MUST be at /public/firebase-messaging-sw.js
   Copy the SAME Firebase config values from your firebaseConfig.ts
   ──────────────────────────────────────────────────────────────────
*/

importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

// ── Same config as your firebaseConfig.ts ────────────────────────
firebase.initializeApp({
   apiKey: "AIzaSyC3CWgbVMX4ITNzQ5D0ZGfsmLpImAFupLI",
  authDomain: "parttime-jobs-9b736.firebaseapp.com",
  projectId: "parttime-jobs-9b736",
  storageBucket: "parttime-jobs-9b736.firebasestorage.app",
  messagingSenderId: "234889445653",
  appId: "1:234889445653:web:bdf44e3270c35c3b71a91c",
  measurementId: "G-11GDDTHRRL"
});

const messaging = firebase.messaging();

// ── Fires when app is CLOSED or in background ─────────────────────
messaging.onBackgroundMessage((payload) => {
    console.log("📩 [SW] Background push received:", payload);

    const title = payload.notification?.title || payload.data?.title || "New Notification";
    const body  = payload.notification?.body  || payload.data?.body  || "";
    const icon  = payload.notification?.icon  || "/logo192.png";
    const tag   = payload.data?.type          || "default";
    const url   = payload.data?.url           || "/notifications";

    self.registration.showNotification(title, {
        body,
        icon,
        badge:    "/logo192.png",
        tag,
        renotify: true,
        vibrate:  [200, 100, 200],
        data:     { url },
        actions: [
            { action: "view",    title: "📋 View" },
            { action: "dismiss", title: "✕ Dismiss" },
        ],
    });
});

// ── Click → open or focus the app ────────────────────────────────
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    if (event.action === "dismiss") return;

    const targetUrl = event.notification.data?.url || "/notifications";

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && "focus" in client) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
                if (clients.openWindow) return clients.openWindow(targetUrl);
            })
    );
});
