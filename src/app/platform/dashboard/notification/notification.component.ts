import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Client, Databases, Query } from 'appwrite';
import { interval, Subscription, take } from 'rxjs';
import { NotificationMessage } from 'src/app/services/notification.service';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.sass'],
  animations: [
    trigger('slideInOut', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', animate('300ms ease-in')),
      transition('* => void', animate('300ms ease-out'))
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  currentNotification: NotificationMessage | null = null;
  private subscription: Subscription | undefined;
  showNotification = false;
  markForm: FormGroup;
  isProcessing = false;
  remainingTime = 300; // 5 minutes in seconds
  private timerSubscription: Subscription | undefined;
  
  private client: Client;
  private databases: Databases;
  private dbName = 'NotificationsDB';
  private storeName = 'notifications';

  constructor(
    private notificationsService: NotificationsService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.markForm = this.fb.group({
      marks: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    // Initialize Appwrite
    this.client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
    this.databases = new Databases(this.client);
  }

  ngOnInit() {
    this.subscription = this.notificationsService.getCurrentMessage()
      .subscribe(message => {
        if (message) {
          this.currentNotification = message;
          this.showNotification = true;
          this.startTimer();
        }
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.timerSubscription?.unsubscribe();
  }

  private startTimer() {
    // Reset timer
    this.remainingTime = 300;
    
    // Clear existing timer if any
    this.timerSubscription?.unsubscribe();
    
    // Start new timer
    this.timerSubscription = interval(1000)
      .pipe(take(301)) // 300 seconds + 1 for initial state
      .subscribe(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          this.hideNotification();
        }
      });
  }

  async submitMark() {
    if (this.markForm.invalid || !this.currentNotification) {
      return;
    }

    try {
      this.isProcessing = true;

      // Extract assessment details from notification body
      let assessmentName = '';
      let assessmentSubject = '';
      
      // Handle different notification body formats
      const notificationBody = this.currentNotification.body;
      
      if (notificationBody.includes('_')) {
        // Format: "assessmentName_subject"
        const parts = notificationBody.split('_');
        assessmentName = parts[0].trim();
        assessmentSubject = parts[1].trim();
      } else if (notificationBody.includes('Mathematics')) {
        // Format: "assessmentName Mathematics"
        assessmentName = notificationBody.replace('Mathematics', '').trim();
        assessmentSubject = 'Mathematics';
      } else {
        // Try to extract information from the notification title if body parsing fails
        assessmentName = this.currentNotification.title || 'Unknown Assessment';
        assessmentSubject = notificationBody || 'Unknown Subject';
      }
      
      
      // Get studentId from localStorage
      const studentId = localStorage.getItem('studentID');
      if (!studentId) {
        throw new Error('Student ID not found');
      }

      // Find the assessment document
      const response = await this.databases.listDocuments(
        'thuto', // Database ID
        'assessments', // Collection ID
        [
           Query.equal('student_id', studentId),
           Query.equal('title', assessmentName),
           Query.equal('subject', assessmentSubject)
        ]
      );

      if (response.documents.length === 0) {
        throw new Error('Assessment not found');
      }

      const assessmentDoc = response.documents[0];
      const mark = ((parseInt(this.markForm.get('marks')?.value.toString())/30)*100).toFixed(2)
      console.log(mark)
      const body = {
        "assessment_id": assessmentDoc.$id,
        "marks_obtained": mark
      };

      

      this.http.post("https://thuto.server.nexgenlabs.co.za:5001/update-self-reported-mark", body)
        .subscribe(
          (data: any) => {
            
            // Remove notification from IndexedDB
            this.removeNotificationFromIndexedDB();
            
            // Close the notification
            this.hideNotification();
          },
          (error: any) => {
            console.error('Error updating mark:', error);
            alert("Failed to Update Mark, Please See Your Teacher (Assessment ID: " + assessmentDoc.$id + ")");
          }
        );
    } catch (error) {
      console.error('Error submitting marks:', error);
      // Handle error
    } finally {
      this.isProcessing = false;
    }
  }

  // Remove notification from IndexedDB after successful mark submission
  private removeNotificationFromIndexedDB(): void {
    if (!this.currentNotification?.body) return;
    
    try {
      // For notifications with assessment_subject format
      if (this.currentNotification.body.includes('_')) {
        // Get the assessment name (first part before underscore)
        const assessmentName = this.currentNotification.body.split('_')[0].trim();
        
        const dbRequest = indexedDB.open(this.dbName, 1);
        
        dbRequest.onsuccess = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) return;
          
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          
          // Delete by assessment name
          const deleteRequest = store.delete(assessmentName);
          
          deleteRequest.onsuccess = () => {
          };
          
          deleteRequest.onerror = (event:any) => {
            console.error('Error removing notification:', event);
          };
        };
      } else {
        console.warn('Cannot remove notification - body does not contain assessment name in expected format');
      }
    } catch (error) {
      console.error('Error in removeNotificationFromIndexedDB:', error);
    }
  }

  hideNotification() {
    this.showNotification = false;
    this.timerSubscription?.unsubscribe();
    this.markForm.reset();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}