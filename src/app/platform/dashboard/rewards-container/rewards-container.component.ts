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
  .setEndpoint('https://appwrite.flowspaceproducitivity.com/v1')
  .setProject('654ef9645b3a060ec136');

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

featureMap:any={}
rating:any = 0;
levels:any =["This Needs Improvement","You're Doing Well","Excellent, We see you Mr CEO","No History"]
score:any = 0

perc:number = 0 
residue:number = 0 



async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "654ef9a9319f62f3952c",
    "654ef9b9893d07c640ba",
    [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')?.split("@")[0]||'')]
  )

  return this.processArray(promise.documents)
}

async ReadStudent(){
  let promise = await this.databases.listDocuments(
    "654ef9a9319f62f3952c",
    "659500443605a8e23728",
    [Query.limit(2),Query.equal('email',localStorage.getItem('studentID')||'')]
  )
  return promise.documents[0];
}

processArray(inputArray:any) {
  let resultArray = [...inputArray];

  for (let i = 0; i < resultArray.length; i++) {
      const currentObject = resultArray[i];
      const currentValue = currentObject.amount;
      console.log(currentValue)

      if (currentValue > 0) {
          // Check for the corresponding negative value
          const correspondingIndex = resultArray.findIndex(obj => obj.amount === -currentValue);
          console.log(correspondingIndex)
          if (correspondingIndex !== -1) {
              // Set the item_purchased field to "saved" for both objects
              resultArray[i].item_purchased = "saved";
              resultArray[correspondingIndex].item_purchased = "saved";
          }
      }
  }
  console.log(resultArray)
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
    this.calculateBalance()
    this.calculateSpent()
    this.calculateSaved()
    this.calculateDeposit()
    let value = localStorage.getItem("parentMode")
    if(value?.includes("true")){
      this.mode = true
    }
    this.gatherSpentItems()
    
    
  }

calculateBalance(){
  this.transactions.forEach((transaction:any) => {
    this.balance+=transaction.amount
  });
}

calculateDeposit(){
  this.transactions.forEach((transaction:any) => {
    if(transaction.item_purchased=="Parent deposit"){
      this.totalDeposited+=transaction.amount
    }
  });
  this.reload()
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
    if(transaction.account.toLowerCase().includes("savings")){
      this.saved+=transaction.amount
    }
    
  });
}

gatherSpentItems(){
  this.transactions.forEach((transaction:any) => {
    if(transaction.amount<0){
      this.spent_transactions.push(transaction)
    }
    
  });
  this.spent_transactions.reverse()
  
}

reload(){
  this.TCCount = 0
  this.subjectStats = null
  this.http.get("https://server.flowspaceproducitivity.com:3500/score/subject_score?studentId="+this.student.email+"&programId=basic_Program"+"&depositAmount="+this.totalDeposited).subscribe(
    (score:any)=>{
      this.TCCount = score.toFixed(2)
      this.balance = (parseFloat(this.TCCount) + parseFloat(this.spent)).toFixed(2)
      this.calculateFQ(this.transactions)
    },
    (err)=>{
        console.log(err)
    })

  this.http.get("https://server.flowspaceproducitivity.com:3500/score/subject_stats?studentId="+this.student.email+"&programId=basic_Program"+"&depositAmount="+this.totalDeposited).subscribe(
      (data:any)=>{
        this.subjectStats = data
        this.subjectStats.forEach((elem:any)=>{
          let transaction = {
            amount : elem.earned.toFixed(2),
            date : Date.now().toString(),
            item_purchased: this.mapSubjectToCategory(elem.subjectName),
            account:"transactional"
          }
          this.schoolearned.push(transaction)
        })
      },(err)=>{
        console.log(err)
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

mapSubjectToCategory(subject:any) {
  switch (subject) {
      case "Afrikaans FAL":
        return "Business Law";
      case "English HL":
          return "The Humanitarian Business";
      case "Social Science":
          return "Business Consumer Studies";
      case "Life Orientation":
          return "Commerce In Education";
      case "Natural Science and Technology":
          return "Business Mathematics and Informatics";
      case "Economic Management Sciences":
          return "Business Account and Economic Sciences";
      case "Mathematics":
          return "Business In Engineering";
      // Add more cases as needed
      default:
          return "Unknown Category";
  }
}

}
