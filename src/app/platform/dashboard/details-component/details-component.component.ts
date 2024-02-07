import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Client, Databases, Query } from 'appwrite';

@Component({
  selector: 'app-details-component',
  templateUrl: './details-component.component.html',
  styleUrls: ['./details-component.component.sass']
})
export class DetailsComponentComponent implements OnInit {

  stats:any
  studentId:any = localStorage.getItem('studentID')
  accountTotal:any = 1000
  subjectStats:any
  loader = false
  programs:any = []
  programIDs:any = []
  testValue = new FormControl();
  isParentMode:boolean = false;

  constructor(private http:HttpClient) { }

  client = new Client()
  .setEndpoint('https://appwrite.flowspaceproducitivity.com/v1')
  .setProject('654ef9645b3a060ec136');

  databases = new Databases(this.client);

  async ReadTransactions(){
    let promise = await this.databases.listDocuments(
      "654ef9a9319f62f3952c",
      "654ef9b9893d07c640ba",
      [Query.limit(500),Query.equal('owner',localStorage.getItem('studentID')?.split("@")[0]||'')]
    )
    return promise.documents;
  }

  async ReadAssessments(){
    let promise = await this.databases.listDocuments(
      "654ef9a9319f62f3952c",
      "659fe319e187ce2be36c",
      [Query.limit(125),Query.equal('student_id',localStorage.getItem('studentID')?.split("@")[0]||'')]
    )
    return promise.documents;
  }

  transactions:any
  assessment:any


  async ngOnInit(): Promise<void> {
    this.loader = true
    this.http.get("https://server.flowspaceproducitivity.com:3500/score/subject_stats?studentId="+this.studentId+"&programId=basic_Program&depositAmount="+this.accountTotal).subscribe(
      (data:any)=>{
        this.subjectStats = data
        this.loader = false
      },(err)=>{
        console.log(err)
      }
    )

    if(localStorage.getItem('parentMode')?.includes('true')){
      this.isParentMode = true
    }

    this.http.get("https://server.flowspaceproducitivity.com:3500/program/retrieve_all").subscribe(data=>{
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

}
