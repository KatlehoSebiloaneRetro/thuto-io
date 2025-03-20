import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client, Account } from 'appwrite';
import { TuiAlertService } from '@taiga-ui/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  userEmail: string = '';
  userName: string = '';
  isLoading: boolean = true;
  isParentMode: boolean = false;

  // Appwrite client setup
  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
  account = new Account(this.client);

  constructor(
    private router: Router,
    private readonly alertService: TuiAlertService
  ) { }

  ngOnInit(): void {
    // Check if user is in parent mode
    this.isParentMode = localStorage.getItem('parentMode') === 'true';
    
    // Get current user information
    this.loadUserInfo();
  }

  clearLocalStorage(): void {
    try {
      localStorage.clear();
      this.clearDatabase('NotificationsDB')
      console.log('Successfully cleared all localStorage data');
      
      // Optional: Show a notification to the user
      alert('All app data has been cleared successfully');
      this.logout_no_ask()
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      alert('Failed to clear app data. Please try again.');
    }
  }


  clearDatabase(dbName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      
      request.onsuccess = () => {
        console.log(`Database ${dbName} successfully deleted`);
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting database ${dbName}:`, event);
        reject(event);
      };
    });
  }
  /**
   * Load the current user's information from Appwrite
   */
  loadUserInfo(): void {
    this.isLoading = true;

    // Get account details
    this.account.get()
      .then(response => {
        this.userEmail = response.email;
        this.userName = response.name;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error getting user details:', error);
        this.alertService.open('Failed to load user information', {
          status: 'error'
        }).subscribe();
        this.isLoading = false;
        
        // If we can't get user info, they might not be logged in
        // Redirect to login after a short delay
        if (error.code === 401) {
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1000);
        }
      });
  }

  /**
   * Logout the current user and redirect to login page
   */
  logout(): void {
    // Show confirmation dialog
    if (confirm('Are you sure you want to log out?')) {
      this.isLoading = true;
      
      // Delete the current session
      this.account.deleteSession('current')
        .then(() => {
          
          // Clear local storage
          localStorage.removeItem('parentMode');
          localStorage.removeItem('studentID');
          
          // Show success message
          this.alertService.open('Logged out successfully', {
            status: 'success'
          }).subscribe();
          
          // Redirect to login page
          this.router.navigate(['/']);
        })
        .catch(error => {
          console.error('Logout failed:', error);
          this.alertService.open('Failed to log out: ' + error.message, {
            status: 'error'
          }).subscribe();
          this.isLoading = false;
        });
    }
  }

  logout_no_ask(): void {
    // Show confirmation dialog
    if (true) {
      this.isLoading = true;
      
      // Delete the current session
      this.account.deleteSession('current')
        .then(() => {
          
          // Clear local storage
          localStorage.removeItem('parentMode');
          localStorage.removeItem('studentID');
          
          // Show success message
          this.alertService.open('Logged out successfully', {
            status: 'success'
          }).subscribe();
          
          // Redirect to login page
          this.router.navigate(['/']);
        })
        .catch(error => {
          console.error('Logout failed:', error);
          this.alertService.open('Failed to log out: ' + error.message, {
            status: 'error'
          }).subscribe();
          this.isLoading = false;
        });
    }
  }

  /**
   * Navigate back to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dash']);
  }
}