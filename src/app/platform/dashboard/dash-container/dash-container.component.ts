import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Client, Databases, Query } from 'appwrite';
import { AssessmentDialogComponent } from '../../assessment-dialog/assessment-dialog/assessment-dialog.component';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { NotificationMessage, NotificationService } from 'src/app/services/notification.service';
import { interval, Subscription } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';
import { PwaService } from '../services/pwa.service';
import { SwUpdate } from '@angular/service-worker';

interface Student {
  email: string;
  name: string;
  surname: string;
  parent?: string;
}

interface StudentData {
  student: Student;
  balance: number;
  fqScore: number;
  subjectStats: any[];
  transactions: any[];
  TCCount: number;
  spent: number;
  saved: number;
  totalDeposited: number;
  animal: string;
  rating: number;
  showGood: boolean;
  showBest: boolean;
  showWorse: boolean;
}

@Component({
  selector: 'app-dash-container',
  templateUrl: './dash-container.component.html',
  styleUrls: ['./dash-container.component.sass']
})
export class DashContainerComponent implements OnInit {
  loading = true;
  activeItemIndex = 0;
  isParentMode = false;
  currentStudentIndex = 0;
  studentsData: StudentData[] = [];

  // Current view data
  stats: any;
  balance = 0;
  spent = 0;
  saved = 0;
  totalDeposited = 0;
  TCCount = 0;
  earned = 0;
  transactions: any;
  program_id = 'basic_Program';
  student: any;
  subjectStats:any
  pwaPromptVisible = false;
  isIOSDevice = false;

  showGood = false;
  showBest = false;
  showWorse = false;
  requestNotifications:boolean = true
  animal = "none";

  featureMap: any = {};
  rating = 0;
  levels = ["This Needs Improvement", "You're Doing Well", "Excellent, We see you Mr CEO", "No History"];
  score = 0;

  perc = 0;
  residue = 0;
  token = '';

  

  notificationCount: number = 0;
  private subscription: Subscription | undefined;
  private checkInterval: Subscription | undefined;
  
  private dbName = 'NotificationsDB';
  private storeName = 'notifications';

  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');

  databases = new Databases(this.client);

  items = [
    {
      text: 'Summary',
      active: true,
      function: () => {
        this.activeItemIndex = 0;
        this.items.forEach((item, index) => item.active = index === 0);
      }
    },
    {
      text: 'Spent',
      active: false,
      function: () => {
        this.activeItemIndex = 1;
        this.items.forEach((item, index) => item.active = index === 1);
      }
    },
    {
      text: 'Earned',
      active: false,
      function: () => {
        this.activeItemIndex = 2;
        this.items.forEach((item, index) => item.active = index === 2);
      }
    },
    {
      text: 'Invested',
      active: false,
      function: () => {
        this.activeItemIndex = 3;
        this.items.forEach((item, index) => item.active = index === 3);
      }
    },
  ];

  searchForm = new FormGroup({
    value: new FormControl(''),
  });

  constructor(
    private http: HttpClient,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private notificationService: NotificationService, 
    private notificationsService: NotificationsService,
    private pwaService: PwaService,
    private swUpdate: SwUpdate
  ) { }
  

  async ngOnInit(): Promise<void> {

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        // Force refresh for new version
        window.location.reload();
      });
    }

    // Subscribe to PWA prompt visibility
    this.pwaService.isPwaInstallable().subscribe(isVisible => {
      this.pwaPromptVisible = isVisible;
    });
    
    // Check if this is an iOS device
    this.isIOSDevice = this.pwaService.isIOSDevice();

    const requestNotifications = localStorage.getItem("notificationEnabled");
    if(requestNotifications=='True'){
      this.requestNotifications = false
    }

    this.checkNotifications();
    
    // Set up interval to periodically check for new notifications
    this.checkInterval = interval(30000) // Check every 30 seconds
      .subscribe(() => {
        this.checkNotifications();
      });
      
    // Listen for notification service events (optional, for real-time updates)
    this.subscription = this.notificationsService.notifications$
      .subscribe(() => {
        this.checkNotifications();
      });
    
    this.setupNotifications();
    
    // Check parent mode
    const parentMode = localStorage.getItem("parentMode");
    this.isParentMode = parentMode?.includes("true") || false;

    if (this.isParentMode) {
      await this.initializeParentView();
    } else {
      await this.initializeSingleStudentView();
    }
    // Check for self-reported assessments with mark_obtained = 0
    await this.checkSelfReportedAssessments();
    
  }

  // New method to check for self-reported assessments
// New method to check for self-reported assessments
async checkSelfReportedAssessments(): Promise<void> {
  try {
    // First make sure we have a student email
    const studentEmail = this.student?.email || localStorage.getItem('studentID');
    if (!studentEmail) {
      console.log('No student ID available to check assessments');
      return;
    }
    
    // Fetch all assessments for the student
    const response = await firstValueFrom(
      this.http.get(`https://thuto.server.nexgenlabs.co.za:5001/getAssessments`, {
        params: {
          student_id: studentEmail
        }
      })
    );
    
    const assessments = response as any[];
    console.log(assessments);
    
    // Filter for self-reported assessments with mark_obtained = 0
    const pendingSelfReportedAssessments = assessments.filter(assessment => 
      assessment.isSelfReported == true && 
      assessment.marks_obtained == "0"
    );
    
    // If there are any matching assessments, show a notification
    if (pendingSelfReportedAssessments.length > 0) {
      console.log("Found pending self-reported assessments:", pendingSelfReportedAssessments.length);

      pendingSelfReportedAssessments.forEach((assessment: any) => {
        const message: NotificationMessage = {
          title: 'Self-reported Assessments Pending',
          body: assessment.title + "_" + assessment.subject,
          timestamp: new Date()
        };
        
        // Create a payload for the notification service
        const payload = {
          notification: {
            title: message.title,
            body: message.body
          },
          messageId: assessment.title + "_" + assessment.subject
        };
        
        // Add to IndexedDB through the notifications service
        this.notificationsService.addToIndexedDB(payload)
          .then(() => {
            console.log('Notification added to IndexedDB:', message.title);
            
            // Update the notification badge count
            this.checkNotifications();
            
            // Display an alert if the app is open
            alert(message.title + ': ' + message.body);
            
            // Show browser notification if permissions are granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(message.title, {
                body: message.body,
                icon: '/favicon.ico'
              });
            }
          })
          .catch(error => {
            console.error('Error adding notification to IndexedDB:', error);
          });
        
        // Update the current message in the notification service for the popup display
        this.notificationService.currentMessage.next(message);
      });
    }
  } catch (error) {
    console.error('Error checking self-reported assessments:', error);
  }
}



  installPwa() {
    this.pwaService.installPwa();
  }

  // Dismiss the prompt using the service
  dismissPwaPrompt() {
    this.pwaService.dismissPwaPrompt();
  }
  
  // Add this utility method for clearing data (useful for testing)
  clearAppData() {
    localStorage.clear();
    this.pwaService.resetPwaPromptState();
  }

async initializeParentView() {
// In your initializeParentView method
const studentEmail = localStorage.getItem('studentID');
if (!studentEmail) {
  console.error('No student ID found');
  return;
}

try {
  // Find all parent accounts
  const parentAccounts = await this.databases.listDocuments(
    "thuto",
    "parents",
    [Query.limit(500)]
  );

  // First find parents that have this student
  const relevantParents = parentAccounts.documents.filter((parent: any) => 
    parent.child === studentEmail
  );

  if (relevantParents.length === 0) {
    await this.initializeSingleStudentView();
    return;
  }

  // Group parents by their name to find all their children
  const allStudentEmails = new Set<string>();
  
  // For each parent account that has our current student
  relevantParents.forEach((parentAccount: any) => {
    // Find all accounts with the same parent name and surname
    const sameParentAccounts = parentAccounts.documents.filter((p: any) => 
      p.parent === parentAccount.parent && p.surname === parentAccount.surname
    );

    // Add all children from these accounts
    sameParentAccounts.forEach((account: any) => {
      if (account.child) {
        allStudentEmails.add(account.child);
      }
    });
  });


  // Initialize data for each student
  for (const email of allStudentEmails) {
    const studentDocs = await this.databases.listDocuments(
      "thuto",
      "students",
      [Query.equal('email', email)]
    );

    if (studentDocs.documents.length > 0) {
      const student = studentDocs.documents[0];
      const studentData = await this.initializeStudentData(student);
      this.studentsData.push(studentData);
    }
  }

  // Set initial view to the current student
  const currentStudentIndex = this.studentsData.findIndex(
    data => data.student.email === studentEmail
  );
  if (currentStudentIndex !== -1) {
    this.updateCurrentStudentDisplay(currentStudentIndex);
    this.currentStudentIndex = currentStudentIndex;
  } else if (this.studentsData.length > 0) {
    this.updateCurrentStudentDisplay(0);
  }

} catch (error) {
  console.error('Error initializing parent view:', error);
  await this.initializeSingleStudentView();
}

this.loading = false;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.checkInterval?.unsubscribe();
  }

  /**
   * Check IndexedDB for notifications and update the badge count
   */
  private checkNotifications(): void {
    const request = indexedDB.open(this.dbName, 1);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      
      // If the store doesn't exist, there are no notifications
      if (!db.objectStoreNames.contains(this.storeName)) {
        this.notificationCount = 0;
        return;
      }
      
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const countRequest = store.count();
      
      countRequest.onsuccess = () => {
        this.notificationCount = countRequest.result;
      };
      
      countRequest.onerror = (event:any) => {
        console.error('Error counting notifications:', event);
      };
    };
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'notificationId' });
      }
    };
  }

  async initializeSingleStudentView() {
    this.student = await this.ReadStudent();
    const studentData = await this.initializeStudentData(this.student);
    this.studentsData = [studentData];
    this.updateCurrentStudentDisplay(0);
    this.loading = false;
  }

  async initializeStudentData(student: any): Promise<StudentData> {
    console.log(student)
    const transactions = await this.ReadTransactions(student.email);
    transactions.reverse()
    
    const spent = this.calculateSpentForStudent(transactions);
    const saved = this.calculateSavedForStudent(transactions);
    const totalDeposited = this.calculateDepositForStudent(transactions);
    const balance = await this.calculateBalanceForStudent(student.email,totalDeposited,spent);
    
    const subjectStats = await firstValueFrom(
      this.http.get<any>(`https://thuto.server.nexgenlabs.co.za:6500/score/subject_stats`, {
        params: {
          studentId: student.email,
          programId: this.program_id,
          depositAmount: totalDeposited.toString()
        }
      })
    );

    const { score, animal, rating, showGood, showBest, showWorse } = 
      await this.calculateFQForStudent(transactions, totalDeposited);

    return {
      student,
      balance,
      fqScore: score,
      subjectStats,
      transactions,
      TCCount: this.calculateTCCount(totalDeposited, rating),
      spent,
      saved,
      totalDeposited,
      animal,
      rating,
      showGood,
      showBest,
      showWorse
    };
  }

  async ReadStudent() {
    console.log(localStorage.getItem('studentID'))
    const result = await this.databases.listDocuments(
      "thuto",
      "students",
      [Query.limit(2), Query.equal('email', localStorage.getItem('studentID') || '')]
    );
    
    return result.documents[0];
  }

  async ReadTransactions(studentEmail: string) {
    const result = await this.databases.listDocuments(
      "thuto",
      "transactions",
      [Query.limit(500), Query.equal('owner', studentEmail || '')]
    );
    return this.processArray(result.documents);
  }

  async calculateBalanceForStudent(email: any, totalDeposited: any, spent: any): Promise<any> {
    console.log(email)
    console.log("total deposited:"+totalDeposited)
    console.log(spent)
    try {
        const response:any = await this.http.get(
            `https://thuto.server.nexgenlabs.co.za:6500/score/subject_score?studentId=${email}&programId=${this.program_id}&depositAmount=${totalDeposited}`
        ).toPromise();
        
        const TCCount = parseFloat(response).toFixed(2);
        console.log(TCCount)
        
        const balance = (parseFloat(TCCount) + parseFloat(spent)).toFixed(2);
        console.warn(balance);
        
        return balance;
    } catch (err) {
        throw err; // Re-throwing the error so it can be handled by the caller
    }
}

  calculateSpentForStudent(transactions: any[]): number {
    return transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) {
        return acc + transaction.amount;
      }
      return acc;
    }, 0);
  }

  calculateSavedForStudent(transactions: any[]): number {
    return transactions.reduce((acc, transaction) => {
      if (transaction.account.includes("sav")) {
        return acc + transaction.amount;
      }
      return acc;
    }, 0);
  }

  calculateDepositForStudent(transactions: any[]): number {
    return transactions.reduce((acc, transaction) => {
      if (transaction.item_purchased === "Parent deposit") {
        return acc + transaction.amount;
      }
      return acc;
    }, 0);
  }

  async calculateFQForStudent(transactions: any[], totalDeposited: number) {
    const TCCount = await this.getTCCount(totalDeposited);
    const spent = this.calculateSpentForStudent(transactions);
    const saved = this.calculateSavedForStudent(transactions);

    const spendingRatio = 1 - (Math.abs(spent) / TCCount) * 1.05;
    const earningRatio = TCCount / totalDeposited;
    const savingsRatio = (saved / TCCount) * 3;

    const featureMap = Number.isNaN(savingsRatio) ? 
      { feature1: 0, feature2: 0, feature3: 0 } :
      { feature1: spendingRatio, feature2: earningRatio, feature3: savingsRatio };

    const score = ((((featureMap.feature1 + featureMap.feature2 + featureMap.feature3) / 3) * 100) * 5).toFixed(2);
    const scoreNum = parseFloat(score);

    let rating = 0;
    let animal = "mouse";
    let showGood = false;
    let showBest = false;
    let showWorse = false;

    if (scoreNum < 245) {
      rating = 0;
      showWorse = true;
      animal = "mouse";
    } else if (scoreNum <= 345) {
      rating = 1;
      showGood = true;
      animal = "lion";
    } else {
      rating = 2;
      showBest = true;
      animal = "camel";
    }

    return { score: scoreNum, animal, rating, showGood, showBest, showWorse };
  }

  calculateTCCount(totalDeposited: number, rating: number): number {
    const baseTC = totalDeposited * (rating === 0 ? 0.9 : rating === 1 ? 1.2 : 1.4);
    return parseFloat(baseTC.toFixed(2));
  }

  async getTCCount(totalDeposited: number): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.http.get<number>(`https://thuto.server.nexgenlabs.co.za:6500/score/subject_score`, {
          params: {
            studentId: this.student.email,
            programId: this.program_id,
            depositAmount: totalDeposited.toString()
          }
        })
      );
      return response;
    } catch (error) {
      console.error('Error getting TC Count:', error);
      return 0;
    }
  }

  nextStudent() {
    if (this.currentStudentIndex < this.studentsData.length - 1) {
      this.currentStudentIndex++;
      this.updateCurrentStudentDisplay(this.currentStudentIndex);
    }
  }

  previousStudent() {
    if (this.currentStudentIndex > 0) {
      this.currentStudentIndex--;
      this.updateCurrentStudentDisplay(this.currentStudentIndex);
    }
  }

  updateCurrentStudentDisplay(index: number) {
    const currentData = this.studentsData[index];
    this.balance = currentData.balance;
    this.TCCount = currentData.TCCount;
    this.spent = currentData.spent;
    this.saved = currentData.saved;
    this.totalDeposited = currentData.totalDeposited;
    this.subjectStats = currentData.subjectStats;
    this.animal = currentData.animal;
    this.score = currentData.fqScore;
    this.showGood = currentData.showGood;
    this.showBest = currentData.showBest;
    this.showWorse = currentData.showWorse;
    this.student = currentData.student;
  }

  processArray(inputArray: any[]) {
    let resultArray = [...inputArray];
    
    for (let i = 0; i < resultArray.length; i++) {
      const currentObject = resultArray[i];
      const currentValue = currentObject.amount;
      
      if (currentValue > 0) {
        const correspondingIndex = resultArray.findIndex(obj => obj.amount === -currentValue);
        
        if (correspondingIndex !== -1) {
          resultArray[i].item_purchased = "saved";
          resultArray[correspondingIndex].item_purchased = "saved";
        }
      }
    }
    
    return resultArray;
  }

  // Notification methods
  async setupNotifications() {
    try {
      await this.notificationService.onMessage();
    } catch (err) {
    }
  }

  async requestPermission() {
    this.loading = true
    try {
      const token = await this.notificationService.requestPermission();
      if (token) {
        this.token = token;
        localStorage.setItem('notificationEnabled','True')
        
        // Get the student's email from localStorage
        const studentEmail = localStorage.getItem('studentID');
        if (!studentEmail) {
          console.error('No student ID found in localStorage');
          return;
        }
  
        // Query the students collection to find the student
        const studentDocs = await this.databases.listDocuments(
          "thuto",
          "students",
          [Query.equal('email', studentEmail)]
        );
  
        if (studentDocs.documents.length === 0) {
          console.error('Student not found in database');
          return;
        }
  
        // Get the student document ID and update it with the new token
        const studentDoc = studentDocs.documents[0];
        await this.databases.updateDocument(
          "thuto",
          "students",
          studentDoc.$id,
          {
            notificationToken: token
          }
        );

        this.ngOnInit()
  
      }
    } catch (error) {
      console.error('Error updating notification token:', error);
      alert("Something went wrong please try again later")
    }
  }

  showModal: boolean = false;
    
    openCardModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

  // Assessment dialog
  async showAssessments(subject: string) {
    try {
      this.loading = true;
      const response = await firstValueFrom(
        this.http.get(`https://thuto.server.nexgenlabs.co.za:5001/getAssessments`, {
          params: {
            student_id: this.student.email
          }
        })
      );
      
      const allAssessments = response as any[];
      const subjectAssessments = allAssessments.filter(assessment => {
        const normalizedAssessmentSubject = assessment.subject?.toString().toLowerCase().trim() || '';
        const normalizedSearchSubject = subject?.toString().toLowerCase().trim() || '';
        return normalizedAssessmentSubject.startsWith(normalizedSearchSubject);
      });
      
      this.dialogService.open(
        new PolymorpheusComponent(AssessmentDialogComponent),
        {
          data: {
            subject: subject,
            assessments: subjectAssessments,
            loading: false
          },
          dismissible: true,
          size: 'l'
        }
      ).subscribe();
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      this.loading = false;
    }
  }
}