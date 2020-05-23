importScripts('https://www.gstatic.com/firebasejs/7.13.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.13.1/firebase-messaging.js');

const CACHE_NAME = "cache-v1.0";
const urlsToCache = [
  '/css/style.css',
  '/js/chat_functions.js',
  '/js/firebase_init.js',
  '/js/script.js',
  '/js/offline_script.js',
  '/offline.html',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu72xKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu5mxKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu7mxKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4WxKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu7WxKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu7GxKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2',
  // Images
  '/images/icons/icon-152x152.png'
];
const OFFLINE_FILE = 'offline.html';

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.add(new Request(OFFLINE_FILE), {cache: 'reload'});
      return cache.addAll(urlsToCache);
    })
  );
  console.log("Service Worker installing");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match(OFFLINE_FILE));
    })
  );
});

self.addEventListener("activate", () => {
  console.log("Service Worker activating");
  self.clients.claim();
});

const firebaseConfig = {
  apiKey: "AIzaSyBjV9M-Yvl8ffoqYFvYjNdV5NB-ZAYj5vU",
  authDomain: "pwa-chat-e5003.firebaseapp.com",
  databaseURL: "https://pwa-chat-e5003.firebaseio.com",
  projectId: "pwa-chat-e5003",
  storageBucket: "pwa-chat-e5003.appspot.com",
  messagingSenderId: "49804087554",
  appId: "1:49804087554:web:f590282701671aa7ef721b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
  console.log('[FirebaseMessagingSW] Received background message ', payload);
  localStorage.setItem('payload', payload);

  const notificationTitle = 'PWA Chat';
  const notificationOptions = {
    body: "You've got a new message!",
    icon: 'https://pwa-chat-e5003.web.app/images/icons/icon-128x128.png',
    tag: "PWA-Chat_Notification"
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  console.log(event);
  event.notification.close();
  event.waitUntil( clients.openWindow("https://pwa-chat-e5003.web.app").then(() => {}) );
});
