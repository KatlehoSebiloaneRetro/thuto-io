import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Client, Databases, Query } from 'appwrite';

@Component({
  selector: 'app-rewards-container',
  templateUrl: './rewards-container.component.html',
  styleUrls: ['./rewards-container.component.sass']
})
export class EntRewardsContainerComponent implements OnInit {

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

featureMap:any={}
rating:any = 0;
levels:any =["This Needs Improvement","You're Doing Well","Excellent, We see you Mr CEO","No History"]
score:any = 0

perc:number = 0 
residue:number = 0 
program_id = 'basic_Program'



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
        text: 'Withdrawn',
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
        text: 'Opportunities',
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

opps = [
  {
    item_purchased: "Digital Marketing Services",
    amount: "https://link-to-digital-marketing-services",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "E-commerce Platform Development",
    amount: "https://link-to-ecommerce-development",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Mobile App Development",
    amount: "https://link-to-mobile-app-development",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Renewable Energy Solutions",
    amount: "https://link-to-renewable-energy-solutions",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Remote Work Solutions",
    amount: "https://link-to-remote-work-solutions",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Health and Wellness Products",
    amount: "https://link-to-health-and-wellness-products",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Artificial Intelligence Solutions",
    amount: "https://link-to-ai-solutions",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Educational Technology Platforms",
    amount: "https://link-to-edtech-platforms",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Sustainable Fashion Products",
    amount: "https://link-to-sustainable-fashion",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  },
  {
    item_purchased: "Smart Home Devices",
    amount: "https://link-to-smart-home-devices",
    account: "thuto",
    date: new Date(Date.now()).toISOString().split("T")[0],
    opp: true
  }
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
    
    this.transactions.forEach((elem:any)=>{
      if(elem.amount>0){
        elem.item_purchased = "Deposit"
      }else{
        elem.item_purchased = "Withdrawal"
      }
    })
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

  reload(new_program:any){
    this.TCCount = 0
    this.subjectStats
    this.program_id = new_program
  
        this.http.get("http://localhost:6500/score/subject_score?studentId="+this.student.email+"&programId="+this.program_id+"&depositAmount="+this.totalDeposited).subscribe(
          (score:any)=>{
            this.TCCount = score.toFixed(2)
            console.log(this.TCCount)
            this.balance = (parseFloat(this.TCCount)+parseFloat(this.spent)).toFixed(2)
            this.calculateFQ(this.transactions)
          
          },
          (err)=>{
            console.log(err)
          }
        )
    
  }

gatherSpentItems(){
  this.transactions.forEach((transaction:any) => {
    if(transaction.amount<0){
      this.spent_transactions.push(transaction)
    }
    
  });
  this.spent_transactions.reverse()
  
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
    // this.showWorse = true
    this.TCCount = (this.TCCount*0.9).toFixed(2)
    // this.loader = false
  }
  if(this.score>=245&&this.score<=345){
    this.rating = 1
    // this.showGood = true
    this.TCCount = (this.TCCount*1.2).toFixed(2)
    // this.loader = false
  }
  if(this.score>345){
    this.rating = 2
    // this.showBest = true
    this.TCCount = (this.TCCount*1.4).toFixed(2)
    // this.loader = false
  }

  console.log(this.featureMap);
  
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
