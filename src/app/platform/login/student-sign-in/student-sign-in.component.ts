// student-sign-in.component.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Client, Account, ID } from "appwrite";
import { TuiAlertService } from '@taiga-ui/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-student-sign-in',
  templateUrl: './student-sign-in.component.html',
  styleUrls: ['./student-sign-in.component.sass']
})
export class StudentSignInComponent implements OnInit {
  showResetForm = false;
  resetEmailSent = false;

  constructor(
    private router: Router,
    private readonly alertService: TuiAlertService
  ) { }

  readonly testForm = new FormGroup({
    StudentID: new FormControl('', [Validators.required, Validators.email]),
    Password: new FormControl('', Validators.required),
  });

  readonly resetPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  student: boolean = true;
  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
  account = new Account(this.client);

  ngOnInit(): void {
    // Check if there's a password reset completion URL parameter
    const url = new URL(window.location.href);
    const userId = url.searchParams.get('userId');
    const secret = url.searchParams.get('secret');

    if (userId && secret) {
      // Show the complete password reset form
      this.showCompletePasswordReset(userId, secret);
    }
  }

  toggleStudent() {
    localStorage.setItem("parentMode", "true");
    this.student = !this.student;
  }

  signIn() {
    if (this.testForm.invalid) {
      this.alertService.open('Please enter valid credentials').subscribe();
      return;
    }

    const promise = this.account.createEmailSession(
      this.testForm.value.StudentID || "", 
      this.testForm.value.Password || ""
    );

    promise.then(
      (response: any) => {
        this.router.navigate(['/dash']); // Use an array for the route
        if (this.student == false) {
          localStorage.setItem('parentMode', 'true');
          localStorage.setItem('studentID', this.testForm.value.StudentID || "");
        } else {
          localStorage.setItem('parentMode', 'false');
          localStorage.setItem('studentID', this.testForm.value.StudentID || "");
        }
      },
      (error) => {
        this.alertService.open('Login failed: ' + error.message, {
          status: 'error'
        }).subscribe();
      }
    );
  }

  toggleResetForm() {
    this.showResetForm = !this.showResetForm;
    
    // Pre-populate the reset email form with the StudentID if available
    if (this.showResetForm && this.testForm.value.StudentID) {
      this.resetPasswordForm.patchValue({
        email: this.testForm.value.StudentID
      });
    }
  }

  sendPasswordReset() {
    if (this.resetPasswordForm.invalid) {
      this.alertService.open('Please enter a valid email address').subscribe();
      return;
    }

    const email = this.resetPasswordForm.value.email || "";
    
    // Create the URL for the password reset completion (your frontend URL)
    const redirectUrl = window.location.origin + window.location.pathname;
    
    // Send the password reset request
    const promise = this.account.createRecovery(email, redirectUrl);
    
    promise.then(
      (response) => {
        this.resetEmailSent = true;
        this.alertService.open('Password reset email sent! Check your inbox.', {
          status: 'success'
        }).subscribe();
      },
      (error) => {
        console.error('Password reset failed', error);
        this.alertService.open('Failed to send reset email: ' + error.message, {
          status: 'error'
        }).subscribe();
      }
    );
  }

  // Called when user returns from the reset email link
  showCompletePasswordReset(userId: string, secret: string) {
    // Create a modal or form to collect the new password
    // For simplicity, we'll use a prompt here, but you should use a proper form
    const newPassword = prompt('Please enter your new password:');
    
    if (newPassword) {
      // Complete the password recovery
      const promise = this.account.updateRecovery(userId, secret, newPassword, newPassword);
      
      promise.then(
        (response) => {
          this.alertService.open('Password has been reset successfully! Please sign in.', {
            status: 'success'
          }).subscribe();
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        },
        (error) => {
          console.error('Password reset completion failed', error);
          this.alertService.open('Failed to reset password: ' + error.message, {
            status: 'error'
          }).subscribe();
        }
      );
    }
  }

  backToLogin() {
    this.showResetForm = false;
    this.resetEmailSent = false;
  }
}