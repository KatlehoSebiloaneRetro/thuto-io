import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Client, Databases, Query } from 'appwrite';

@Component({
  selector: 'app-dash-container',
  templateUrl: './dash-container.component.html',
  styleUrls: ['./dash-container.component.sass']
})
export class EntDashContainerComponent implements OnInit {

  activeItemIndex = 0;
  stats:any
  studentId:any = 51
  accountTotal:any = 1000
  subjectStats:any
  loader = false
  client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67c5088e003ce7be0f38');

  databases = new Databases(this.client);

  balance:any = 0
  spent:any = 0
  saved:any = 0
  totalDeposited = 0
  TCCount:any = 0
  earned:any = 0 
  transactions:any
  program_id = 'basic_Program'
  student:any

  

  showGood:boolean = false
  showBest:boolean = false
  showWorse:boolean = false

  featureMap:any={}
  rating:any = 0;
  levels:any =["This Needs Improvement","You're Doing Well","Excellent, We see you Mr CEO","No History"]
  score:any = 0

  perc:number = 0 
  residue:number = 0 


async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "transactions",
    [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')||'')]
  )
  return this.processArray(promise.documents);
}

async ReadStudent(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "students",
    [Query.limit(2),Query.equal('email',localStorage.getItem('studentID')||'')]
  )
  return promise.documents[0];
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


constructor(private http: HttpClient) { }

  async ngOnInit(): Promise<void> {
    this.student = await this.ReadStudent()
    this.transactions = await this.ReadTransactions()
    this.calculateBalance()
    this.calculateSpent()
    this.calculateSaved()
    this.calculateDeposit()
    this.http.get("https://thuto.server.nexgenlabs.co.za:6500/score/subject_stats?studentId="+this.student.email+"&programId=basic_Program&depositAmount="+this.totalDeposited).subscribe(
      (data:any)=>{
        this.subjectStats = data
        this.loader = false
      },(err)=>{
      }
    )
  }

  calculateBalance(){
    this.transactions.forEach((transaction:any) => {
      this.balance+=transaction.amount
    });
  }

  calculateDeposit(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="Parent deposit" || transaction.item_purchased=="Entrepreneur deposit"){
        this.totalDeposited+=transaction.amount
      }
    });
    this.perc = 50
    this.residue = 50
    this.reload(this.program_id)
  }
  
  calculateSpent(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.amount<0){
        this.spent+=transaction.amount
      }
      
    });
  }
  calculateSaved(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.account.includes("sav")){
        this.saved+=transaction.amount
      }
      
    });
  }

  processArray(inputArray:any) {
    let resultArray = [...inputArray];
  
    for (let i = 0; i < resultArray.length; i++) {
        const currentObject = resultArray[i];
        const currentValue = currentObject.item_purchased;
  
        if (currentValue > 0) {
            // Check for the corresponding negative value
            const correspondingIndex = resultArray.findIndex(obj => obj.item_purchased === -currentValue);
  
            if (correspondingIndex !== -1) {
                // Set the item_purchased field to "saved" for both objects
                resultArray[i].item_purchased = "saved";
                resultArray[correspondingIndex].item_purchased = "saved";
            }
        }
    }
  
    return resultArray;
  
  }
  
  reload(new_program:any){
    this.TCCount = 0
    this.subjectStats
    this.program_id = new_program
  
        this.http.get("https://thuto.server.nexgenlabs.co.za:6500/score/subject_score?studentId="+this.student.email+"&programId="+this.program_id+"&depositAmount="+this.totalDeposited).subscribe(
          (score:any)=>{
            this.TCCount = score.toFixed(2)
            this.balance = (parseFloat(this.TCCount)+parseFloat(this.spent)).toFixed(2)
            this.calculateFQ(this.transactions)
          
          },
          (err)=>{
          }
        )
    
  }

  calculateFQ(array:any){
    let svd = this.TCCount/this.totalDeposited
    let sve = this.spent/this.TCCount
    
    let totalInvested = 0
    array.forEach((element:any) => {
      if(element.isInvestment){
        totalInvested+=element.amount
      }
    });

    let svi = totalInvested/this.spent
    
    if(Number.isNaN(svi)){
      this.featureMap= {
        feature1:0,
        feature2:0,
        feature3:0,
      }
    }else{
      this.featureMap= {
        feature1:svd,
        feature2:(1-sve),
        feature3:svi,
      }
    }


    this.score = ((((this.featureMap.feature1+this.featureMap.feature2+this.featureMap.feature3)/3)*100)*5).toFixed(2)
    this.perc = (this.score/500)*100
    this.residue = 100-this.perc

    if(this.score<245){
      this.rating = 0
      this.showWorse = true
      this.TCCount = (this.TCCount*0.9).toFixed(2)
      this.loader = false
    }
    if(this.score>=245&&this.score<=345){
      this.rating = 1
      this.showGood = true
      this.TCCount = (this.TCCount*1.2).toFixed(2)
      this.loader = false
    }
    if(this.score>345){
      this.rating = 2
      this.showBest = true
      this.TCCount = (this.TCCount*1.4).toFixed(2)
      this.loader = false
    }

    
  }

}
