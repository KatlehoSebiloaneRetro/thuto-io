import { Component, OnInit, Input, OnDestroy, NgZone } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';
import { Notification } from '../services/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.sass'],
  animations: [
    trigger('notificationAnimation', [
      // Initial state (hidden)
      state('void', style({
        transform: 'translateY(-20px)',
        opacity: 0
      })),
      // Entry animation
      transition('void => *', [
        animate('300ms ease-out', style({
          transform: 'translateY(0)',
          opacity: 1
        }))
      ]),
      // Exit animation
      transition('* => void', [
        animate('200ms ease-in', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  @Input() position: 'top' | 'bottom' = 'top';
  @Input() maxNotifications: number = 5;
  @Input() autoClose: boolean = true;
  @Input() duration: number = 5000; // Default duration in ms
  
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();
  private dbName = 'NotificationsDB';
  private storeName = 'notifications';

  constructor(
    private notificationsService: NotificationsService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Load notifications from IndexedDB first
    this.loadNotificationsFromIndexedDB();

    // Subscribe to new notifications from the service
    this.subscription = this.notificationsService.notifications$.subscribe(
      notification => this.addNotification(notification)
    );

    // Set up listener for background messages
    this.setupBackgroundMessageListener();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Load all notifications from IndexedDB
   */
  loadNotificationsFromIndexedDB(): void {
    const dbRequest = indexedDB.open(this.dbName, 1);

    dbRequest.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };

    dbRequest.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'notificationId' });
      }
    };

    dbRequest.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        // Process the notifications from IndexedDB
        this.ngZone.run(() => {
          const storedNotifications = getAllRequest.result || [];
          
          // Convert stored notifications to app notification format
          const appNotifications = storedNotifications.map((storedItem:any) => {
            try {
              // Parse the payload string back to an object
              const payload = JSON.parse(storedItem.payload);
              
              // Create notification object from payload
              return {
                id: storedItem.notificationId,
                title: payload.notification?.title || 'Notification',
                message: payload.notification?.body || 'New notification received',
                type: 'info', // Default type
                timestamp: storedItem.timestamp,
                // Add other properties as needed
                raw: payload // Keep the raw payload for reference
              } as Notification;
            } catch (error) {
              console.error('Error parsing notification payload:', error);
              return null;
            }
          })
          .filter((n:any) => n !== null) // Remove any failed parses
          .sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp, newest first
          
          // Add to the notifications array
          this.notifications = [...appNotifications.slice(0, this.maxNotifications)];
        });
      };

      getAllRequest.onerror = (event:any) => {
        console.error('Error getting notifications from IndexedDB:', event);
      };
    };
  }

  /**
   * Set up listener for background messages
   */
  setupBackgroundMessageListener(): void {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION') {
        this.ngZone.run(() => {
          const notification: Notification = {
            id: 'notification-' + Date.now(),
            title: event.data.title || 'Notification',
            message: event.data.body || 'New notification received',
            type: 'info'
          };
          this.addNotification(notification);
          
          // Also refresh the IndexedDB data
          this.loadNotificationsFromIndexedDB();
        });
      }
    });
  }

  addNotification(notification: Notification): void {
    // Generate unique ID if not provided
    if (!notification.id) {
      notification.id = 'notification-' + Date.now();
    }
    
    // Add new notification to the beginning of the array
    this.notifications = [notification, ...this.notifications];
    
    // Limit the number of notifications displayed
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
  }

  removeNotification(id: any): void {
    // Remove from UI
    this.notifications = this.notifications.filter(notification => notification.id !== id);
    
    // Remove from IndexedDB if available
    const dbRequest = indexedDB.open(this.dbName, 1);
    dbRequest.onsuccess = (event: any) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains(this.storeName)) {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.delete(id);
      }
    };
  }

  getPositionClass(): string {
    return `notifications-container--${this.position}`;
  }

  getTypeClass(type: string): string {
    return `notification--${type}`;
  }

  // Swipe handling for mobile
  swipeStart: number = 0;
  currentNotificationId: string | null = null;

  onTouchStart(event: TouchEvent, notificationId: any): void {
    this.swipeStart = event.touches[0].clientX;
    this.currentNotificationId = notificationId;
  }

  onTouchMove(event: TouchEvent, notificationElement: HTMLElement): void {
    if (!this.currentNotificationId) return;
    
    const xDiff = event.touches[0].clientX - this.swipeStart;
    
    // Only allow swiping right (positive xDiff)
    if (xDiff > 0) {
      notificationElement.style.transform = `translateX(${xDiff}px)`;
      notificationElement.style.opacity = `${1 - (xDiff / 200)}`;
    }
  }

  onTouchEnd(event: TouchEvent, notificationElement: HTMLElement): void {
    if (!this.currentNotificationId) return;
    
    const xDiff = event.changedTouches[0].clientX - this.swipeStart;
    
    // If swiped more than 100px, dismiss the notification
    if (xDiff > 100) {
      this.removeNotification(this.currentNotificationId);
    } else {
      // Reset position if not dismissed
      notificationElement.style.transform = '';
      notificationElement.style.opacity = '';
    }
    
    this.currentNotificationId = null;
  }
  
  // Handle notification click to show mark recording component
  openMarkRecordingForm(notification: Notification): void {
    
    // For assessment notifications related to Mathematics
    if (notification.title?.includes('Assessment') || 
        notification.raw?.notification?.title?.includes('Assessment') ||
        notification.message?.includes('Mathematics')) {
      
      
      // Parse notification to extract needed information
      let notificationBody = notification.message || notification.raw?.notification?.body || '';
      let title = notification.title || 'New Assessment Created';
      
      // Create the message object in the format expected by your service
      const message: any = {
        title: title,
        body: notificationBody,
        timestamp: new Date(),
        id: notification.id // Include ID for later deletion
      };
      
      // Set the current message using your existing notification service pattern
      this.notificationsService.currentMessage.next(message);
    } else {
    }
  }

  /**
   * Clears all notifications from IndexedDB
   */
  clearAllNotifications(): void {
    const dbRequest = indexedDB.open(this.dbName, 1);

    dbRequest.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        this.ngZone.run(() => {
          this.notifications = [];
        });
      };
      
      clearRequest.onerror = (event:any) => {
        console.error('Error clearing notifications from IndexedDB:', event);
      };
    };
  }
}