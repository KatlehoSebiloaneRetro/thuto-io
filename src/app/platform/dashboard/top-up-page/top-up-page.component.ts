import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Client, Databases, ID } from 'appwrite';
import { environment } from "../../../../environments/environment"

@Component({
  selector: 'app-top-up-page',
  templateUrl: './top-up-page.component.html',
  styleUrls: ['./top-up-page.component.sass']
})
export class TopUpPageComponent implements OnInit {
  isProcessing = false;
  payFastForm: any;
  
  // PayFast merchant details
  private readonly MERCHANT_ID = '10033967'; // From PayFast dashboard
  private readonly MERCHANT_KEY = 'o477br2xzaw6w'; // From PayFast dashboard
  private readonly RETURN_URL = `${window.location.origin}/dash`; // Success URL
  private readonly CANCEL_URL = `${window.location.origin}/top-up`; // Cancel URL
  
  constructor(
    private router: Router
  ) {}

  studentOwner = localStorage.getItem('studentID');
  searchForm = new FormGroup({
    value: new FormControl(0),
  });

  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');

  databases = new Databases(this.client);

  ngOnInit(): void {
    // Set up PayFast form on init
    this.setupPayFastForm();
  }

  private setupPayFastForm() {
    // Create hidden form for PayFast
    this.payFastForm = document.createElement('form');
    this.payFastForm.method = 'POST';
    this.payFastForm.action = environment.production 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';
  }

  private generatePaymentReference(): string {
    return `THUTO-${this.studentOwner}-${Date.now()}`;
  }

  async Deposit() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    const amount = parseFloat(this.searchForm.value.value?.toString() || '0');
    const paymentRef = this.generatePaymentReference();

    try {
      // Create PayFast form data
      const formData = {
        merchant_id: this.MERCHANT_ID,
        merchant_key: this.MERCHANT_KEY,
        return_url: this.RETURN_URL,
        cancel_url: this.CANCEL_URL,
        name_first: this.studentOwner || 'Student',
        email_address: this.studentOwner || '',
        m_payment_id: paymentRef,
        amount: amount.toFixed(2),
        item_name: 'Thuto Coins Purchase',
      };

      // Clear any existing form fields
      this.payFastForm.innerHTML = '';

      // Add fields to form
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        this.payFastForm.appendChild(input);
      });



            // Create initial transaction record
            await this.databases.createDocument(
              'thuto',
              'transactions',
              ID.unique(),
              {
                owner: this.studentOwner,
                amount: amount,
                isInvestment: false,
                date: Date.now().toString(),
                time: Date.now().toString(),
                item_purchased: "Parent deposit",
                account: this.studentOwner + " transactional",
              }
            );

      // Add form to body and submit
      document.body.appendChild(this.payFastForm);
      this.payFastForm.submit();



    } catch (error) {
      console.error('Payment initialization failed:', error);
      this.isProcessing = false;
    }
  }
}