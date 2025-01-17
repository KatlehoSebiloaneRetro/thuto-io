import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Client, Databases,Query } from 'appwrite';
@Component({
  selector: 'app-program-container',
  templateUrl: './program-container.component.html',
  styleUrls: ['./program-container.component.sass'],
})
export class EntProgramContainerComponent implements OnInit {

  constructor(private http:HttpClient) { }

  items = [
    {
        text: 'Program',
        active: true,
        function: ()=>{
          this.activeItemIndex = 0;
          this.items[0].active = true
          this.items[1].active = false
        }
    },
    {
        text: 'How It Works',
        active: false,
        function: ()=>{
          this.activeItemIndex = 1;
          this.items[1].active = true
          this.items[0].active = false
        }
    }
];

activeItemIndex = 0;
stats:any
studentId:any = localStorage.getItem('studentID')
subjectStats:any
loader = false
programs:any = []
programIDs:any = []
testValue = new FormControl();
client = new Client().setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1').setProject('672b43fb00096f3a294e');
databases = new Databases(this.client);
balance:any = 0
spent:any = 0
saved:any = 0
totalDeposited = 0
TCCount:any = 0
transactions:any

async ReadTransactions(){
  let promise = await this.databases.listDocuments(
    "thuto",
    "transactions",
    [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')?.split("@")[0]||'')]
  )
  return promise.documents;
}

  async ngOnInit(){
    this.transactions = await this.ReadTransactions()
    this.loader = true
    this.calculateDeposit()
    this.http.get("http://localhost:6500/score/subject_stats?studentId="+this.studentId+"&programId=basic_Program&depositAmount="+this.totalDeposited).subscribe(
      (data:any)=>{
        this.subjectStats = data
        this.loader = false
      },(err)=>{
        console.log(err)
      }
    )

    this.http.get("https://thuto.appwrite.nexgenlabs.co.za/program/retrieve_all").subscribe(data=>{
      this.programs = data
      this.programs.forEach((elem:any)=>{
        this.programIDs.push(elem.id)
      })
      console.log(this.programIDs)
    })
  
  }

  changeValue(){
    console.log(this.testValue.value)
  }

  calculateDeposit(){
    this.transactions.forEach((transaction:any) => {
      if(transaction.item_purchased=="Parent deposit"){
        this.totalDeposited+=transaction.amount
      }
    });
  }



}
