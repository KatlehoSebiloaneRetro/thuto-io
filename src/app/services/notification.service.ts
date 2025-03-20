// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  title: string;
  body: string;
  timestamp?: Date;
  id?:string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messaging;
  currentMessage = new BehaviorSubject<NotificationMessage | null>(null);

  constructor() {
    const app = initializeApp(environment.firebase);
    this.messaging = getMessaging(app);
    
    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION') {
          this.currentMessage.next({
            title: event.data.title,
            body: event.data.body,
            timestamp: new Date()
          });
          alert(event.data.title); // This will show when app is open
          
        }
      });
    }
  }

  async requestPermission(): Promise<string | undefined> {
    try {
      const token = await getToken(this.messaging, { 
        vapidKey: environment.firebase.vapidKey 
      });
      if (token) {
        return token;
      }
      return undefined;
    } catch (err) {
      return undefined;
    }
  }

  onMessage(): (() => void) | undefined {
    try {
      return onMessage(this.messaging, (payload) => {
        this.storeNotification(payload)
        
        const message: NotificationMessage = {
          title: payload.notification?.title || 'New Notification',
          body: payload.notification?.body || '',
          timestamp: new Date()
        };
        
        this.currentMessage.next(message);
        alert(message.title); // Shows alert when app is open
        
        // You could also show a more sophisticated notification UI here
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(message.title, {
            body: message.body,
            icon: '/favicon.ico'
          });
        }
      });
    } catch (err) {
      return undefined;
    }
  }

  // Optional: method to get notification history or current notification
  getCurrentMessage() {
    return this.currentMessage.asObservable();
  }

  storeNotification(payload:any) {
    // Extract key from notification body if it's an assessment notification
    let notificationId:any;
    
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
    dbPromise.onupgradeneeded = function(event:any) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        // Using the notificationId as key
        db.createObjectStore('notifications', { keyPath: 'notificationId' });
      }
    };
  
    // Handle errors
    dbPromise.onerror = function(event:any) {
      console.error('IndexedDB error:', event.target.error);
    };
  
    // Once the database is open, add the notification
    dbPromise.onsuccess = function(event:any) {
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
      
      request.onerror = function(event:any) {
        console.error('Error saving to IndexedDB:', event.target.error);
      };
      
      transaction.oncomplete = function() {
        db.close();
      };
    };
  }
}