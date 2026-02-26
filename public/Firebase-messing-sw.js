// /* eslint-disable no-restricted-globals */
// /* global firebase, self */
// /* eslint-env serviceworker */
// // // firebase-messaging-sw.js
// importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// firebase.initializeApp({
//   apiKey: "AIzaSyC3CWgbVMX4ITNzQ5D0ZGfsmLpImAFupLI",
//   authDomain: "parttime-jobs-9b736.firebaseapp.com",
//   projectId: "parttime-jobs-9b736",
//   storageBucket: "parttime-jobs-9b736.firebasestorage.app",
//   messagingSenderId: "234889445653",
//   appId: "1:234889445653:web:bdf44e3270c35c3b71a91c",
//   measurementId: "G-11GDDTHRRL"
// });
// const messaging = firebase.messaging();

// // Handle background messages for push notifications
// messaging.onBackgroundMessage(function (payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   const notificationTitle = payload.notification?.title || 'Notification';

//   // Determine sound based on payload or default to new booking sound
//   // Note: Custom sounds in SW are not supported in all browsers/OS
//   const soundPath = '/sounds/new-booking.mp3';

//   const notificationOptions = {
//     body: payload.notification?.body,
//     icon: '/logo.png', // Change to your app icon if needed
//     data: payload.data || {},
//     sound: soundPath,
//     renotify: true,
//     tag: payload.data?.bookingId || 'general-notification'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });








importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

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

messaging.onBackgroundMessage((payload) => {
  console.log("🌙 Background message:", payload);

  self.registration.showNotification(
    payload.notification?.title || "Notification",
    {
      body: payload.notification?.body,
      icon: "/logo192.png",
    }
  );
});
