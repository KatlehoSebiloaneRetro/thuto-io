import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Client, Account, ID } from "appwrite";

@Component({
  selector: 'app-student-sign-in',
  templateUrl: './student-sign-in.component.html',
  styleUrls: ['./student-sign-in.component.sass']
})
export class StudentSignInComponent {

  constructor(private router: Router) { }

  readonly testForm = new FormGroup({
    StudentID: new FormControl('student220@student.thuto.io'),
    Password: new FormControl('password'),
});

student:boolean = true
client = new Client()
  .setEndpoint('https://appwrite.flowspaceproducitivity.com/v1')
  .setProject('654ef9645b3a060ec136');
account = new Account(this.client)


  toggleStudent(){
    localStorage.setItem("parentMode", "true")
    this.student = !this.student
  }

  signIn(){
    console.log(this.testForm.value.StudentID||"", this.testForm.value.Password||"")
    const promise = this.account.createEmailSession(this.testForm.value.StudentID||"", this.testForm.value.Password||"");

    promise.then(
      (response: any) => {
        console.log(response);
        this.router.navigate(['/dash']); // Use an array for the route
        if(this.student==false){
          localStorage.setItem('parentMode','true')
          localStorage.setItem('studentID',this.testForm.value.StudentID||"")
        }else{
          localStorage.setItem('parentMode','false')
          localStorage.setItem('studentID',this.testForm.value.StudentID||"")
        }
      },
      (error) => {
        console.log(error);
      }
    );

  }

  createUsers(){
    const promise = this.account.createEmailSession('student150@student.thuto.io', 'password');

    promise.then(
      (response: any) => {
        console.log(response);
        this.router.navigate(['/dash']); // Use an array for the route
        if(this.student==false){
          localStorage.setItem('parentMode','true')
        }else{
          localStorage.setItem('parentMode','false')
        }
      },
      (error) => {
        console.log(error);
      }
    );
}
}
