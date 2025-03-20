import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Client, Account } from 'appwrite';
import { TuiAlertService } from '@taiga-ui/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.sass']
})
export class ChangePasswordComponent implements OnInit {
  isLoading: boolean = false;
  submitAttempted: boolean = false;

  // Initialize Appwrite client
  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
  account = new Account(this.client);

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      this.passwordStrengthValidator
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ])
  }, { validators: this.passwordMatchValidator });

  constructor(
    private router: Router,
    private readonly alertService: TuiAlertService
  ) { }

  ngOnInit(): void {
    // Check if user is logged in
    this.checkSession();
  }

  /**
   * Check if user has an active session
   */
  checkSession(): void {
    this.isLoading = true;
    this.account.get()
      .then(() => {
        // User is logged in, can continue
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error checking session:', error);
        this.alertService.open('You must be logged in to change your password', {
          status: 'error'
        }).subscribe();
        
        // Redirect to login
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      });
  }

  /**
   * Custom validator for password strength
   */
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    
    // Password must meet at least 3 of these criteria
    const validConditions = [hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar]
      .filter(condition => condition).length;
      
    return validConditions >= 3 ? null : { weakPassword: true };
  }

  /**
   * Validator to check if passwords match
   */
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Submit the form to change password
   */
  onSubmit(): void {
    this.submitAttempted = true;
    
    if (this.passwordForm.invalid) {
      this.alertService.open('Please fix the form errors before submitting', {
        status: 'error'
      }).subscribe();
      return;
    }
    
    this.isLoading = true;
    const currentPassword = this.passwordForm.get('currentPassword')?.value || '';
    const newPassword = this.passwordForm.get('newPassword')?.value || '';
    
    // Update the password through Appwrite
    this.account.updatePassword(newPassword, currentPassword)
      .then(response => {
        this.isLoading = false;
        
        this.alertService.open('Password changed successfully!', {
          status: 'success'
        }).subscribe();
        
        // Navigate back to settings
        setTimeout(() => {
          this.router.navigate(['/settings']);
        }, 1500);
      })
      .catch(error => {
        console.error('Error changing password:', error);
        this.isLoading = false;
        
        // Handle specific error cases
        let errorMessage = 'Failed to change password';
        
        if (error.code === 401) {
          errorMessage = 'Current password is incorrect';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.alertService.open(errorMessage, {
          status: 'error'
        }).subscribe();
      });
  }

  /**
   * Navigate back to settings page
   */
  goBackToSettings(): void {
    this.router.navigate(['/settings']);
  }

  /**
   * Get field error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.passwordForm.get(controlName);
    
    if (!control || !control.errors || !control.touched && !this.submitAttempted) {
      return '';
    }
    
    if (control.errors['required']) {
      return 'This field is required';
    }
    
    if (control.errors['minlength']) {
      return `Must be at least ${controlName === 'currentPassword' ? '6' : '8'} characters`;
    }
    
    if (control.errors['weakPassword']) {
      return 'Password must include 3 of the following: uppercase, lowercase, numbers, special characters';
    }
    
    return '';
  }

  /**
   * Check if form has a specific error
   */
  hasFormError(errorName: string): boolean {
    return this.passwordForm.errors !== null && 
           errorName in this.passwordForm.errors && 
           (this.submitAttempted || this.passwordForm.get('confirmPassword')!.touched);
  }
}