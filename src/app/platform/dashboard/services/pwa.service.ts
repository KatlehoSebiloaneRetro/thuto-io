import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  public installPromptEvent = new BehaviorSubject<any>(null);
  public pwaPromptVisible = new BehaviorSubject<boolean>(false);
  private isIOS: boolean;
  
  constructor(private swUpdate: SwUpdate) {
    this.isIOS = this.detectIOS();
    this.initPwaPrompt();
    this.checkPromptStatus();
  }

  // Detect iOS devices
  private detectIOS(): boolean {
    const userAgent = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  }

  // Initialize the PWA prompt detection
  private initPwaPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.promptEvent = event;
      this.installPromptEvent.next(event);
      
      // If we received a native prompt, mark it for later use
      // But don't show it yet - we'll manage visibility separately
      if (!this.isPwaInstalled()) {
        this.pwaPromptVisible.next(true);
      }
    });

    // Handle installation success
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwaInstalled', 'true');
      this.pwaPromptVisible.next(false);
      this.installPromptEvent.next(null);
    });
    
    // Check if in standalone mode
    if (this.isPwaInstalled()) {
      this.pwaPromptVisible.next(false);
    }
  }

  // Check if we should show the prompt based on user history
  private checkPromptStatus() {
    // For iOS, we should always show our custom prompt after a delay
    if (this.isIOS) {
      this.forceShowPrompt(2000);
      return;
    }
    
    // If never prompted or last prompt was more than 3 days ago
    const lastPrompt = localStorage.getItem('lastPwaPrompt');
    const now = Date.now();
    
    if (!this.isPwaInstalled() && 
        (!lastPrompt || (now - parseInt(lastPrompt)) > (3 * 24 * 60 * 60 * 1000))) {
      // Force show the prompt after a short delay
      this.forceShowPrompt(2000);
    }
  }
  
  // Check if PWA is already installed
  private isPwaInstalled(): boolean {
    // Check different ways an app might be installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    const pwaInstalled = localStorage.getItem('pwaInstalled') === 'true';
    
    return isStandalone || pwaInstalled;
  }

  // Force show the prompt after a delay
  private forceShowPrompt(delayMs: number = 1000) {
    setTimeout(() => {
      if (!this.isPwaInstalled()) {
        this.pwaPromptVisible.next(true);
      }
    }, delayMs);
  }
  
  // Show the installation prompt
  installPwa() {
    if (this.promptEvent) {
      // Use native prompt on supported browsers
      this.promptEvent.prompt();
      
      this.promptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          localStorage.setItem('pwaInstalled', 'true');
        }
        
        this.promptEvent = null;
        this.pwaPromptVisible.next(false);
      });
    } else {
      // For iOS - we can't install programmatically,
      // but we've already shown instructions
      this.dismissPwaPrompt();
    }
  }

  // Check if PWA prompt should be shown
  isPwaInstallable(): Observable<any> {
    return this.pwaPromptVisible.asObservable();
  }
  
  // Get iOS status
  isIOSDevice(): boolean {
    return this.isIOS;
  }

  // Dismiss the prompt
  dismissPwaPrompt() {
    this.pwaPromptVisible.next(false);
    localStorage.setItem('lastPwaPrompt', Date.now().toString());
  }

  // Reset PWA prompt state (useful for testing)
  resetPwaPromptState() {
    localStorage.removeItem('pwaInstalled');
    localStorage.removeItem('lastPwaPrompt');
    
    // Force show the prompt
    this.pwaPromptVisible.next(true);
  }
}