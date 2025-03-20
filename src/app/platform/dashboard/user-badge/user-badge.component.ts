//user-badge.component.ts
import { Component, OnInit } from '@angular/core';
import { Client, Account } from 'appwrite';

@Component({
  selector: 'app-user-badge',
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.sass']
})
export class UserBadgeComponent implements OnInit {
  userInitial: string = '?';
  isLoading: boolean = true;
  backgroundColor: string = '';

  // Initialize Appwrite client
  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');
  account = new Account(this.client);

  constructor() { }

  ngOnInit(): void {
    this.loadUserInitial();
    this.generateBackgroundColor();
  }

  /**
   * Load the user's email and extract the first letter
   */
  loadUserInitial(): void {
    // First check if we have a studentID in localStorage
    const storedEmail = localStorage.getItem('studentID');
    
    if (storedEmail && storedEmail.length > 0) {
      this.userInitial = storedEmail.charAt(0).toUpperCase();
      this.isLoading = false;
      return;
    }
    
    // If not in localStorage, try to get from Appwrite
    this.account.get()
      .then(response => {
        if (response.email) {
          this.userInitial = response.email.charAt(0).toUpperCase();
        }
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error getting user email:', error);
        this.userInitial = '?'; // Use ? as fallback
        this.isLoading = false;
      });
  }

  /**
   * Generate a consistent background color based on the initial
   */
  generateBackgroundColor(): void {
    // List of nice, accessible colors for badges
    const colors = [
      '#4caf50', // green
      '#2196f3', // blue
      '#9c27b0', // purple
      '#f44336', // red
      '#ff9800', // orange
      '#009688', // teal
      '#673ab7', // deep purple
      '#3f51b5', // indigo
      '#e91e63', // pink
      '#795548'  // brown
    ];
    
    // Use a hash of the first letter to pick a consistent color
    const charCode = this.userInitial.charCodeAt(0) || 65; // A if no character
    const colorIndex = charCode % colors.length;
    this.backgroundColor = colors[colorIndex];
  }
}