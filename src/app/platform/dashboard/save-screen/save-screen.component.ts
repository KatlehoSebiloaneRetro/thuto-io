import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TuiDialogService } from '@taiga-ui/core';
import { Client, Databases, ID, Query } from "appwrite";
@Component({
  selector: 'app-save-screen',
  templateUrl: './save-screen.component.html',
  styleUrls: ['./save-screen.component.sass']
})
export class SaveScreenComponent implements OnInit {

  constructor(@Inject(TuiDialogService) private readonly dialogs: TuiDialogService,private http:HttpClient) { }

  searchForm = new FormGroup({
    savingPeriod: new FormControl(0),
    initialDeposit: new FormControl(0),
    monthlyPayment: new FormControl(0),
    value: new FormControl(0),
  });

  client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67c5088e003ce7be0f38');

databases = new Databases(this.client);

transactions:any
saved:number = 0
interestRate:any = 9
savedCalculation:any = 0
subscription:any
balance:any = 0


/**
 * Calculates the total available Thuto Coins for the student
 * This includes their current balance plus any money they've already spent
 * @returns Promise<number> The total available Thuto Coins
 */
async calculateAvailableThutoCoins(): Promise<number> {
  try {
    // Get the student ID from localStorage
    const studentId = localStorage.getItem('studentID');
    if (!studentId) {
      console.error('No student ID found in localStorage');
      return 0;
    }
    
    // Fetch the student's transactions
    const transactionsResult = await this.databases.listDocuments(
      "thuto",
      "transactions",
      [Query.limit(500), Query.equal('owner', studentId)]
    );
    
    const transactions = this.processArray(transactionsResult.documents);
    
    // Calculate total deposits
    const totalDeposited = transactions.reduce((acc, transaction) => {
      if (transaction.item_purchased === "Parent deposit") {
        return acc + transaction.amount;
      }
      return acc;
    }, 0);
    
    // Calculate spent amount (exclude savings)
    const spent = transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0 &&  
          !transaction.account.includes("sav")) {
        return acc + Math.abs(transaction.amount);
      }
      return acc;
    }, 0);
    
    // Fetch the current TC balance
    const response = await this.http.get<any>(
      `https://thuto.server.nexgenlabs.co.za:6500/score/subject_score`, {
        params: {
          studentId: studentId,
          programId: 'basic_Program',
          depositAmount: totalDeposited.toString()
        }
      }
    ).toPromise();
    
    // Current TC balance + already spent amount = total available
    const tcBalance:any = parseFloat(response || '0');
    this.balance = tcBalance + spent;
    
    return this.balance;
  } catch (error) {
    console.error('Error calculating available Thuto Coins:', error);
    return 0;
  }
}


/**
 * Process array to identify savings transactions
 * @param inputArray The array of transactions
 * @returns Processed array of transactions
 */
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


/**
 * Validates if a transaction is legal based on available balance
 * @param amount The amount to be spent
 * @returns Promise<boolean> Whether the transaction is legal
 */
async validateTransaction(amount: number): Promise<boolean> {
  // Make sure amount is positive for comparison
  const absAmount = Math.abs(amount);
  
  // Get the current available balance if not already calculated
  if (!this.balance) {
    await this.calculateAvailableThutoCoins();
  }
  
  // Check if student has enough balance
  return this.balance >= absAmount;
}
  
  async ngOnInit(): Promise<void> {
    await this.calculateAvailableThutoCoins();
    this.transactions = await this.ReadTransactions()
    this.calculateSaved()
  }

  
async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "transactions",
    [Query.equal("owner",localStorage.getItem('studentID')||'')]
  )
  return promise.documents;
}

  calculateSaved(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.account.includes("savings")){
        this.saved+=transaction.amount
      }
      
    });
  }

  async createSaveTransaction() {
    let value: number = parseInt(this.searchForm.value.value?.toString() || '0');
    
    // Validate that the student has enough funds to save
    const isValid = await this.validateTransaction(value);
    
    if (!isValid) {
      // Show error dialog or message
      this.dialogs.open('You cannot save more than you have earned. Your available balance is: ' + this.balance, 
        {label: 'Insufficient Funds', size: 's'}).subscribe();
      return; // Exit the function early if validation fails
    }
    
    // Proceed with creating the transactions
    let saveTransaction_add = {
      owner: localStorage.getItem('studentID'),
      amount: value,
      isInvestment: false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account: localStorage.getItem('studentID') + " savings"
    }
    
    let saveTransaction_minus = {
      owner: localStorage.getItem('studentID'),
      amount: -1 * value,
      isInvestment: false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account: localStorage.getItem('studentID') + " transactional"
    }
    
    this.saved += value;
    this.searchForm.patchValue({
      value: 0
    });
  
    try {
      // Create both documents and wait for them to complete
      const promise1 = this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        saveTransaction_add
      );
      
      const promise2 = this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        saveTransaction_minus
      );
  
      await promise1;
      await promise2;
      
      // Show success message
      this.dialogs.open('Successfully saved ' + value + ' Thuto Coins', 
        {label: 'Success', size: 's'}).subscribe();
      
      // Close the dialog
      this.closeDialog();
      
      // Refresh available balance
      await this.calculateAvailableThutoCoins();
    } catch (error) {
      console.error('Error creating transactions:', error);
      this.dialogs.open('An error occurred while processing your transaction. Please try again.', 
        {label: 'Error', size: 's'}).subscribe();
    }
  }

  async createWithdrawTransaction() {
    let value: number = parseFloat(this.searchForm.value.value?.toString() || '0');
    
    // Validate that the student has enough saved funds to withdraw
    if (value > this.saved) {
      // Show error dialog or message
      this.dialogs.open('You cannot withdraw more than you have saved. Your saved balance is: ' + this.saved, 
        {label: 'Insufficient Savings', size: 's'}).subscribe();
      return; // Exit the function early if validation fails
    }
    
    // Proceed with creating the transactions
    let saveTransaction_minus = {
      owner: localStorage.getItem('studentID'),
      amount: -1 * value,
      isInvestment: false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account: localStorage.getItem('studentID') + " savings"
    }
    
    let saveTransaction_plus = {
      owner: localStorage.getItem('studentID'),
      amount: value,
      isInvestment: false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account: localStorage.getItem('studentID') + " transactional"
    }
  
    this.saved = this.saved - value;
    
    this.searchForm.patchValue({
      value: 0
    });
  
    try {
      // Create both documents and wait for them to complete
      const promise1 = this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        saveTransaction_minus
      );
      
      const promise2 = this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        saveTransaction_plus
      );
  
      await promise1;
      await promise2;
      
      // Show success message
      this.dialogs.open('Successfully withdrew ' + value + ' Thuto Coins from savings', 
        {label: 'Success', size: 's'}).subscribe();
      
      // Close the dialog
      this.closeDialog();
      
      // Refresh available balance
      await this.calculateAvailableThutoCoins();
    } catch (error) {
      console.error('Error creating withdrawal transactions:', error);
      this.dialogs.open('An error occurred while processing your withdrawal. Please try again.', 
        {label: 'Error', size: 's'}).subscribe();
    }
  }

  calculateTotalSavings(){
    const initialDepositValue = this.searchForm.value.initialDeposit ? parseFloat(this.searchForm.value.initialDeposit.toString()) : 0;
    const monthlyPaymentValue = this.searchForm.value.monthlyPayment ? parseFloat(this.searchForm.value.monthlyPayment.toString()) : 0;
    const savingPeriodValue = this.searchForm.value.savingPeriod ? parseFloat(this.searchForm.value.savingPeriod.toString()) : 0;
  
    const months = savingPeriodValue;
    let totalAmount = initialDepositValue;
  
    for (let i = 0; i < months; i++) {
      totalAmount += monthlyPaymentValue;
      totalAmount *= 1 + this.interestRate / 100 / 12; // calculate monthly interest
    }

    this.savedCalculation = totalAmount
    
  }

  showDialog(content: any): void {
    this.subscription = this.dialogs.open(content,{dismissible: content}).subscribe();
}

closeDialog():void{
  this.subscription.unsubscribe()
}
}
