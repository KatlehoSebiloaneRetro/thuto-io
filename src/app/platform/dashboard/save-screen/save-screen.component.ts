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

  constructor(@Inject(TuiDialogService) private readonly dialogs: TuiDialogService) { }

  searchForm = new FormGroup({
    savingPeriod: new FormControl(0),
    initialDeposit: new FormControl(0),
    monthlyPayment: new FormControl(0),
    value: new FormControl(0),
  });

  client = new Client()
  .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
  .setProject('672b43fb00096f3a294e');

databases = new Databases(this.client);

transactions:any
saved:number = 0
interestRate:any = 9
savedCalculation:any = 0
subscription:any
  
  async ngOnInit(): Promise<void> {
    this.transactions = await this.ReadTransactions()
    this.calculateSaved()
  }

  
async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "transactions",
    [Query.equal("owner",localStorage.getItem('studentID')?.split("@")[0]||'')]
  )
  return promise.documents;
}

  calculateSaved(){
    this.transactions.forEach((transaction:any) => {
      console.log(transaction)
      if(transaction.account.includes("savings")){
        this.saved+=transaction.amount
      }
      
    });
  }

  createSaveTransaction(){

    let value: number = parseInt(this.searchForm.value.value?.toString() || '0');

    let saveTransaction_add ={
      owner:localStorage.getItem('studentID')?.split("@")[0],
      amount:value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account: localStorage.getItem('studentID')?.split("@")[0]+" savings"
    }
    let saveTransaction_minus ={
      owner:localStorage.getItem('studentID')?.split("@")[0],
      amount:-1*value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account:localStorage.getItem('studentID')?.split("@")[0]+" transactional"
    }
    this.saved += value
    this.searchForm.patchValue({
      value:0
    })

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
    promise1.then(function (response) {
      console.log(response);

  }, function (error) {
      console.log(error);
  });
    promise2.then((response)=> {
      console.log(response);
      this.closeDialog()
  }, function (error) {
      console.log(error);
  });
  }

  createWithdrawTransaction(){
    let value: number = parseFloat(this.searchForm.value.value?.toString() || '0');

    let saveTransaction_minus ={
      owner:localStorage.getItem('studentID')?.split("@")[0],
      amount:-1*value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account: localStorage.getItem('studentID')?.split("@")[0]+" savings"
    }
    let saveTransaction_plus ={
      owner:localStorage.getItem('studentID')?.split("@")[0],
      amount:value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "saved",
      account:localStorage.getItem('studentID')?.split("@")[0]+" transactional"
    }

    this.saved = this.saved - value

    this.searchForm.patchValue({
      value:0
    })

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
    promise1.then(function (response) {
      console.log(response);
  }, function (error) {
      console.log(error);
  });
    promise2.then((response) =>{
      console.log(response);
      this.closeDialog()
  }, function (error) {
      console.log(error);
  });
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
