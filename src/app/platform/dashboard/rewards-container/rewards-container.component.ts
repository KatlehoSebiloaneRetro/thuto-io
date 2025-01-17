import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Client, Databases, Query } from 'appwrite';

@Component({
  selector: 'app-rewards-container',
  templateUrl: './rewards-container.component.html',
  styleUrls: ['./rewards-container.component.sass']
})
export class RewardsContainerComponent implements OnInit {

constructor(private http:HttpClient) { }

client = new Client()
  .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
  .setProject('672b43fb00096f3a294e');

databases = new Databases(this.client);

balance:any = 0
spent:any = 0
saved:any = 0
totalDeposited = 0
TCCount:any = 0
subjectStats:any
earned:any = 0 
transactions:any
spent_transactions:any =[]
student:any
mode:boolean = false;
schoolearned:any =[]
schoolearnedTrans:any =[]

featureMap:any={}
rating:any = 0;
levels:any =["This Needs Improvement","You're Doing Well","Excellent, We see you Mr CEO","No History"]
score:any = 0

perc:number = 0 
residue:number = 0 

program_id = 'basic_Program'
loader = false;



async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "transactions",
    [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')?.split("@")[0]||'')]
  )

  return this.processArray(promise.documents)
}

async ReadStudent(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "students",
    [Query.limit(2),Query.equal('email',localStorage.getItem('studentID')||'')]
  )
  return promise.documents[0];
}

processArray(inputArray:any) {
  let resultArray = [...inputArray];

  for (let i = 0; i < resultArray.length; i++) {
      const currentObject = resultArray[i];
      const currentValue = currentObject.amount;

      if (currentValue > 0) {
          // Check for the corresponding negative value
          const correspondingIndex = resultArray.findIndex(obj => obj.amount == -currentValue);

          if (correspondingIndex != -1) {
              // Set the item_purchased field to "saved" for both objects
              resultArray[i].item_purchased = "saved";
              resultArray[correspondingIndex].item_purchased = "saved";
          }
      }
  }

  return resultArray;

}

  items = [
    {
        text: 'Summary',
        active: true,
        function: ()=>{
          this.activeItemIndex = 0;
          this.items[0].active = true
          this.items[1].active = false
          this.items[2].active = false
          this.items[3].active = false
        }
    },
    {
        text: 'Spent',
        active: false,
        function: ()=>{
          this.activeItemIndex = 1;
          this.items[0].active = false
          this.items[1].active = true
          this.items[2].active = false
          this.items[3].active = false
        }
    },
    {
        text: 'Earned',
        active: false,
        function: ()=>{
          this.activeItemIndex = 2;
          this.items[0].active = false
          this.items[1].active = false
          this.items[2].active = true
          this.items[3].active = false
        }
    },
    {
        text: 'Invested',
        active: false,
        function: ()=>{
          this.activeItemIndex = 3;
          this.items[0].active = false
          this.items[1].active = false
          this.items[2].active = false
          this.items[3].active = true
        }
    },
];


searchForm = new FormGroup({
  value: new FormControl(''),
});

activeItemIndex = 0

async ngOnInit(): Promise<void> {
    this.student = await this.ReadStudent()
    this.transactions = await this.ReadTransactions()
    this.transactions.reverse()
    console.log(this.transactions)
    this.calculateBalance()
    this.calculateSpent()
    this.calculateSaved()
    this.calculateDeposit()
    let value = localStorage.getItem("parentMode")
    if(value?.includes("true")){
      this.mode = true
    }
    this.gatherSpentItems()
    this.http.get("http://localhost:6500/score/subject_stats?studentId="+this.student.email+"&programId=basic_Program&depositAmount="+this.totalDeposited).subscribe(
      (data:any)=>{
        this.schoolearned = data
        this.schoolearned.forEach((item:any)=>{
          this.schoolearnedTrans.push(
            {
              date:Date.now(),
              item_purchased:item.subjectName,
              amount: item.earned,
              account:'saver'
            }
          )
          this.loader = false
        })
      },(err)=>{
        console.log(err)
      }
    )
    
  }

  calculateBalance(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="bank withdrawal"){
        console.log("skipped")
      }else{
        this.balance+=transaction.amount
      }
    });
    console.log(this.balance)
  }

  calculateDeposit(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="Parent deposit"){
        this.totalDeposited+=transaction.amount
      }
    });
    this.perc = 50
    this.residue = 50
    this.reload(this.program_id)
  }
  
  calculateSpent(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.amount<0 && transaction.item_purchased!="bank withdrawal"){
        this.spent+=transaction.amount
      }
      
    });
  }
  calculateSaved(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.account.includes("sav")){
        this.saved+=transaction.amount
      }else{
        console.log(transaction.account)
        console.log("skipped")
      }
      
    });
    console.log(this.saved);
  }


gatherSpentItems(){
  this.transactions.forEach((transaction:any) => {
    if(transaction.amount<0){
      this.spent_transactions.push(transaction)
    }
    
  });
  this.spent_transactions.reverse()
  
}

reload(new_program:any){
  this.TCCount = 0
  this.subjectStats
  this.program_id = new_program
  console.warn(this.totalDeposited)
      this.http.get("http://localhost:6500/score/subject_score?studentId="+this.student.email+"&programId="+this.program_id+"&depositAmount="+this.totalDeposited).subscribe(
        (score:any)=>{
          this.TCCount = score.toFixed(2)
          console.log(this.TCCount)
          this.balance = (parseFloat(this.TCCount)+parseFloat(this.spent)).toFixed(2)
          console.warn(this.balance);
          this.calculateFQ(this.transactions)
        
        },
        (err)=>{
          console.log(err)
        }
      )
  
}


calculateFQ(array:any){
  let spendingRatio =1-(Math.abs(this.spent)/this.TCCount)*1.05
  let earningRatio = (this.TCCount/this.totalDeposited)
  let savingsRatio = (this.saved/this.TCCount)*3
 
   
   if(Number.isNaN(savingsRatio)){
     this.featureMap= {
       feature1:0,
       feature2:0,
       feature3:0,
     }
   }else{
     this.featureMap= {
       feature1:spendingRatio,
       feature2:earningRatio,
       feature3:savingsRatio,
     }
   }
   console.log(this.featureMap)
   this.score = ((((this.featureMap.feature1+this.featureMap.feature2+this.featureMap.feature3)/3)*100)*5).toFixed(2)

   if(this.score<245){
     this.rating = 0
     this.TCCount = (this.TCCount*0.9).toFixed(2)

   }
   if(this.score>=245&&this.score<=345){
     this.rating = 1
     this.TCCount = (this.TCCount*1.2).toFixed(2)
   }
   if(this.score>345){
     this.rating = 2
     this.TCCount = (this.TCCount*1.4).toFixed(2)
   }
   
 }


}
