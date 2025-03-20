import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Client, Databases,ID } from 'appwrite';

@Component({
  selector: 'app-top-up-page',
  templateUrl: './top-up-page.component.html',
  styleUrls: ['./top-up-page.component.sass']
})
export class EntTopUpPageComponent implements OnInit {

  constructor() { }

  studentOwner = localStorage.getItem('studentID')
  searchForm = new FormGroup({
    value: new FormControl(0),
  });
  
  client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67c5088e003ce7be0f38');

databases = new Databases(this.client);

  ngOnInit(): void {
  }

  parseFloat(){
    
  }

  Deposit(){
    let value:number = this.searchForm.value.value || 0
    let purchase ={
      owner:this.studentOwner,
      amount:value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "Entrepreneur deposit",
      account:this.studentOwner+" transactional"
    }

    const promise1 = this.databases.createDocument(
      'thuto',
      'transactions',
      ID.unique(),
      purchase
  );

    promise1.then(function (response) {
  }, function (error) {
  });
  }

}
