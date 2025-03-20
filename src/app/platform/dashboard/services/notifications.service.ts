import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Notification } from './notification.model';
import { NotificationMessage } from 'src/app/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new Subject<Notification>();
  notifications$ = this.notificationsSubject.asObservable();
  
  // BehaviorSubject for mark recording component
  public currentMessage = new BehaviorSubject<NotificationMessage | null>(null);
  
  private dbName = 'NotificationsDB';
  private storeName = 'notifications';

  constructor() {
    // Set up listeners for both service worker messages and Firebase messages
    this.setupServiceWorkerListener();
    this.setupFirebaseMessagingListener();
  }
  
  /**
   * Set up listener for service worker messages
   */
  private setupServiceWorkerListener(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        
        // Handle foreground notifications
        if (event.data && event.data.type === 'FOREGROUND_NOTIFICATION') {
          const notification: NotificationMessage = {
            title: event.data.title || 'New Notification',
            body: event.data.body || '',
            timestamp: new Date()
          };
          
          // Display the notification in the app
          this.currentMessage.next(notification);
          
          // Also create a notification in our list
          this.show({
            id: Date.now().toString(),
            title: notification.title,
            message: notification.body,
            type: 'info',
            timestamp: new Date().toISOString()
          });
          
          // Refresh the notifications from IndexedDB
          this.refreshNotifications();
        }
      });
    }
  }
  
  /**
   * Set up listener for Firebase foreground messages if using Firebase
   */
  private setupFirebaseMessagingListener(): void {
    // If you're using the Firebase messaging onMessage handler,
    // you can keep it here, but make sure it also updates the currentMessage
    
    // Example:
    /*
    onMessage(this.messaging, (payload) => {
      
      const message: NotificationMessage = {
        title: payload.notification?.title || 'New Notification',
        body: payload.notification?.body || '',
        timestamp: new Date()
      };
      
      // Set current message to trigger the popup
      this.currentMessage.next(message);
    });
    */
  }

  /**
   * Refresh notifications from IndexedDB
   */
  refreshNotifications(): void {
    this.getAllFromIndexedDB().then(notifications => {
      // Convert to app notifications and emit them
      notifications.forEach(notification => {
        try {
          const payload = JSON.parse(notification.payload);
          
          this.show({
            id: notification.notificationId,
            title: payload.notification?.title || 'Notification',
            message: payload.notification?.body || '',
            type: 'info',
            timestamp: notification.timestamp,
            raw: payload
          });
        } catch (e) {
          console.error('Error parsing notification:', e);
        }
      });
    }).catch(error => {
      console.error('Error refreshing notifications:', error);
    });
  }

  /**
   * Show a notification
   */
  show(notification: Notification): void {
    // Generate ID if not provided
    if (!notification.id) {
      notification.id = 'notification-' + Date.now();
    }
    
    // Emit to subscribers
    this.notificationsSubject.next(notification);
  }

  /**
   * Get all notifications from IndexedDB
   */
  getAllFromIndexedDB(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject('Error opening database');
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
          resolve(getAll.result || []);
        };
        
        getAll.onerror = () => {
          reject('Error retrieving notifications');
        };
      };
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'notificationId' });
        }
      };
    });
  }

  /**
   * Add a notification to IndexedDB manually
   */
  addToIndexedDB(payload: any): Promise<void> {
    // Extract assessment name for key if possible
    let notificationId:any;
    
    if (payload.notification && 
        payload.notification.title && 
        payload.notification.title.includes('Assessment') &&
        payload.notification.body && 
        payload.notification.body.includes('_')) {
      
      notificationId = payload.notification.body.split('_')[0].trim();
    } else {
      notificationId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject('Error opening database');
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const notificationRecord = {
          notificationId: notificationId,
          messageId: payload.messageId || notificationId,
          timestamp: new Date().toISOString(),
          payload: JSON.stringify(payload)
        };
        
        const addRequest = store.put(notificationRecord);
        
        addRequest.onsuccess = () => {
          // Also show the notification
          this.show({
            id: notificationId,
            title: payload.notification?.title || 'Notification',
            message: payload.notification?.body || 'New notification received',
            type: 'info'
          });
          
          resolve();
        };
        
        addRequest.onerror = () => {
          reject('Error adding notification to database');
        };
      };
    });
  }

  /**
   * Delete a notification from IndexedDB by its ID or by assessment name
   */
  deleteFromIndexedDB(notificationIdOrName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject('Error opening database');
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        if (!notificationIdOrName) {
          reject('No notification ID or assessment name provided');
          return;
        }
        
       
        const deleteRequest = store.delete(notificationIdOrName);
        
        deleteRequest.onsuccess = () => {
          resolve();
        };
        
        deleteRequest.onerror = (event:any) => {
          console.error('Error deleting notification:', event);
          reject('Error deleting notification');
        };
      };
    });
  }
  
  /**
   * Delete a notification by extracting the assessment name from the notification body
   */
  deleteByAssessmentName(notificationBody: string): Promise<void> {
    if (!notificationBody || !notificationBody.includes('_')) {
      return Promise.reject('Invalid notification body format');
    }
    
    // Extract the assessment name (first part before underscore)
    const assessmentName = notificationBody.split('_')[0].trim();
    
    return this.deleteFromIndexedDB(assessmentName);
  }

  /**
   * Clear all notifications from IndexedDB
   */
  clearAllFromIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject('Error opening database');
      
      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject('Error clearing notifications');
      };
    });
  }
  
  /**
   * Get current message for mark recording component
   */
  getCurrentMessage() {
    return this.currentMessage.asObservable();
  }
}