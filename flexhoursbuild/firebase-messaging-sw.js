
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAIaHdY0vw-xqXSSB_5ONKOKFqQpdBTiq8",
  authDomain: "flexhours-d094e.firebaseapp.com",
  projectId: "flexhours-d094e",
  storageBucket: "flexhours-d094e.firebasestorage.app",
  messagingSenderId: "1042847599727",
  appId: "10428475997271::web:43a20c08ae58faf0c7919a",
  measurementId: "G-MN7WV83SJ2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("🌙 Background message:", payload);

  self.registration.showNotification(
    payload.notification?.title || "Notification",
    {
      body: payload.notification?.body,
      icon: "/Notification.png",
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/");
    })
  );
});