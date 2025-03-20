// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBi22Ur9W1RGb2gxVm5ilnZFXCRfBTZfz8",
  authDomain: "thuto-io.firebaseapp.com",
  projectId: "thuto-io",
  storageBucket: "thuto-io.firebasestorage.app",
  messagingSenderId: "24367357500",
  appId: "1:24367357500:web:a6f9bc3650aca91eae6d39"
});

const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  // Store notification using IndexedDB (service workers can't access localStorage)
  storeNotification(payload);

  // Send message to clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION',
        payload: payload, // Send the full payload to the client
        title: payload.notification.title,
        body: payload.notification.body
      });
    });
  });

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  // Store notification using IndexedDB (service workers can't access localStorage)
  storeNotification(payload);

  // Send message to clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION',
        payload: payload, // Send the full payload to the client
        title: payload.notification.title,
        body: payload.notification.body
      });
    });
  });

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Function to store notifications in IndexedDB
function storeNotification(payload) {
  // Extract key from notification body if it's an assessment notification
  let notificationId;
  
  if (payload.notification && 
      payload.notification.title && 
      payload.notification.title.includes('Assessment') &&
      payload.notification.body && 
      payload.notification.body.includes('_')) {
    
    // Extract the assessment name (everything before the underscore)
    notificationId = payload.notification.body.split('_')[0].trim();
  } else {
    // Fallback to a unique ID for non-assessment notifications
    notificationId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  // Open (or create) the database
  const dbPromise = indexedDB.open('NotificationsDB', 1);
  
  // Create the schema if needed
  dbPromise.onupgradeneeded = function(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('notifications')) {
      // Using the notificationId as key
      db.createObjectStore('notifications', { keyPath: 'notificationId' });
    }
  };

  // Handle errors
  dbPromise.onerror = function(event) {
    console.error('IndexedDB error:', event.target.error);
  };

  // Once the database is open, add the notification
  dbPromise.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    // Store the stringified payload with a timestamp and the extracted ID
    const notificationRecord = {
      notificationId: notificationId,
      messageId: payload.messageId || notificationId,
      timestamp: new Date().toISOString(),
      payload: JSON.stringify(payload)
    };
    
    const request = store.put(notificationRecord);
    
    request.onsuccess = function() {
    };
    
    request.onerror = function(event) {
      console.error('Error saving to IndexedDB:', event.target.error);
    };
    
    transaction.oncomplete = function() {
      db.close();
    };
  };
}

// Alternative approach: Forward to a client page to store in localStorage
// This function can be used if you prefer the localStorage approach
function forwardToClientForStorage(payload) {
  self.clients.matchAll().then(clients => {
    if (clients.length > 0) {
      // Send to the first available client
      clients[0].postMessage({
        type: 'STORE_NOTIFICATION',
        payload: JSON.stringify(payload)
      });
    } else {
    }
  });
}

