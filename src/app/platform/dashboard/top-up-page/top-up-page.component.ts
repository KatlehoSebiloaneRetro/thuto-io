import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Client, Databases,ID } from 'appwrite';

@Component({
  selector: 'app-top-up-page',
  templateUrl: './top-up-page.component.html',
  styleUrls: ['./top-up-page.component.sass']
})
export class TopUpPageComponent implements OnInit {

  constructor() { }

  studentOwner = localStorage.getItem('studentID')
  searchForm = new FormGroup({
    value: new FormControl(0),
  });
  
  client = new Client()
  .setEndpoint('https://appwrite.flowspaceproducitivity.com/v1')
  .setProject('654ef9645b3a060ec136');

databases = new Databases(this.client);

  ngOnInit(): void {
  }

  parseFloat(){
    
  }

  Deposit(){
    let value:number = this.searchForm.value.value || 0
    let purchase ={
      owner:this.studentOwner?.split('@')[0],
      amount:value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "Parent deposit",
      account:this.studentOwner?.split('@')[0]+" transactional"
    }

    const promise1 = this.databases.createDocument(
      '654ef9a9319f62f3952c',
      '654ef9b9893d07c640ba',
      ID.unique(),
      purchase
  );

    promise1.then(function (response) {
      console.log(response);
  }, function (error) {
      console.log(error);
  });
  }

}
