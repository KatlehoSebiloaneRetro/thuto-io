import { Component, OnInit } from '@angular/core';
import { TuiLoaderModule } from '@taiga-ui/core';
import { Router } from '@angular/router';
import { Client, Account } from 'appwrite';

@Component({
  selector: 'app-login-splash',
  templateUrl: './login-splash.component.html',
  styleUrls: ['./login-splash.component.sass']
})
export class LoginSplashComponent implements OnInit {

  index = 0;
  isLoading = true;
  loadingMessage = 'Loading latest version...';

  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
  account = new Account(this.client);

  constructor(private router:Router) { }

  ngOnInit(): void {
    console.log('LoginSplashComponent initialized');
    this.checkForNewVersion();
    this.checkActiveSession();
  }
  
  /**
   * Checks if user has an active session and redirects to dashboard if they do
   */
  checkActiveSession(): void {
    console.log('Checking for active user session');
    
    this.account.get()
      .then(response => {
        console.log('Active session found:', response);
        // User is logged in, navigate to dashboard
        this.loadingMessage = 'Active session found, redirecting...';
        
        // Give the version check a moment to complete first
        setTimeout(() => {
          this.router.navigate(['/dash']);
        }, 1500);
      })
      .catch(error => {
        console.log('No active session found:', error);
        // No active session, stay on login page
        // Continue with normal loading flow
      });
  }

  /**
   * Checks for the latest version of the application from Firebase hosting
   * and forces a refresh if a new version is available
   */
  checkForNewVersion(): void {
    // Set loading state
    this.isLoading = true;
    console.log('Starting version check, isLoading:', this.isLoading);
    
    // Log current URL
    console.log('Fetching URL:', window.location.href);
    
    // Clear browser cache to force fetching the latest version
    if ('caches' in window) {
      console.log('Cache API available, clearing caches');
      caches.keys().then(cacheNames => {
        console.log('Found caches:', cacheNames);
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
            .then(success => console.log(`Cache '${cacheName}' deleted:`, success))
            .catch(err => console.error(`Error deleting cache '${cacheName}':`, err));
        });
      }).catch(err => {
        console.error('Error accessing caches:', err);
      });
    } else {
      console.log('Cache API not available in this browser');
    }

    // Instead of fetching the current URL (which might 404 for SPAs),
    // fetch the root index.html or a known static asset
    console.log('Sending fetch request with cache: no-store');
    fetch('/', { 
      cache: 'no-store', 
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then(response => {
        console.log('Fetch response received:', response);
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        // Log headers in a compatible way
        const headers:any = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log('Response headers:', headers);
        
        if (response.ok) {
          console.log('Response was OK, checking for service worker updates');
          // Check for service worker updates if available
          if ('serviceWorker' in navigator) {
            console.log('Service Worker API available');
            navigator.serviceWorker.getRegistrations()
              .then(registrations => {
                console.log('Service worker registrations found:', registrations.length);
                for (const registration of registrations) {
                  console.log('Updating service worker:', registration);
                  registration.update()
                    .then(() => console.log('Service worker updated successfully'))
                    .catch(err => console.error('Error updating service worker:', err));
                }
              })
              .catch(err => {
                console.error('Error getting service worker registrations:', err);
              });
          } else {
            console.log('Service Worker API not available');
          }
          
          // Update loading message
          this.loadingMessage = 'Latest version loaded!';
          console.log('Loading complete, setting success message');
          
          // Short delay before completing
          console.log('Setting timeout to hide loader');
          setTimeout(() => {
            this.isLoading = false;
            console.log('Loader hidden, isLoading:', this.isLoading);
          }, 1000);
        } else {
          console.error('Fetch response was not OK');
          console.error('Response status:', response.status);
          console.error('Response statusText:', response.statusText);
          
          this.loadingMessage = 'Unable to fetch latest version. Please refresh.';
          console.log('Setting error message');
          
          response.text().then(text => {
            console.log('Response body:', text.substring(0, 200) + '...');
          }).catch(err => {
            console.error('Could not read response body:', err);
          });
          
          // Still hide loading after a delay
          console.log('Setting timeout to hide loader after error');
          setTimeout(() => {
            this.isLoading = false;
            console.log('Loader hidden after error, isLoading:', this.isLoading);
          }, 3000);
        }
      })
      .catch(error => {
        console.error('Fetch operation failed with error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        this.loadingMessage = 'Connection error. Please refresh.';
        console.log('Setting connection error message');
        
        // Still hide loading after a delay
        console.log('Setting timeout to hide loader after connection error');
        setTimeout(() => {
          this.isLoading = false;
          console.log('Loader hidden after connection error, isLoading:', this.isLoading);
        }, 3000);
      });
      
    console.log('Fetch request initiated (async)');
  }
}