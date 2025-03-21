import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { Account, Client, Databases, ID, Query } from 'appwrite';

@Component({
  selector: 'app-parent-registration',
  templateUrl: './parent-registration.component.html',
  styleUrls: ['./parent-registration.component.sass']
})
export class ParentRegistrationComponent implements OnInit {

  constructor(private router:Router) { }

  studentForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    schoolID: new FormControl(''),
    gender: new FormControl(''),
    race: new FormControl(''),
    age: new FormControl(''),
    schoolName  : new FormControl(''),
    grade: new FormControl(''),
    class: new FormControl('')
  });

  parentForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    relationship: new FormControl(''),
    emailAddress: new FormControl(''),
    cellPhone: new FormControl(''),
    password:new FormControl('')
  });

  client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67c5088e003ce7be0f38');

  databases = new Databases(this.client);
  account = new Account(this.client);
  student:any

  async ReadStudent(studentValue:any){
    let promise = await this.databases.listDocuments(
      "thuto",
      "students",
      [Query.equal('email',studentValue)]
    )
    return promise.documents[0];
  }

  async ngOnInit(): Promise<void> {
    
  }

  async checkStudent(){
    this.student = await this.ReadStudent(this.studentForm.value.schoolID||'')
    if(this.studentForm.value.schoolID?.includes(this.student.email)){
      this.studentForm.patchValue({
        name: this.student.name,
        surname: this.student.surname,
        schoolID: this.student.email,
        gender: this.student.gender,
        race: this.student.race,
        age: this.student.age,
        schoolName  : this.student.schoolName,
        grade: this.student.grade,
        class: this.student.class
      });
    }
  }

  createParent(){
    let parent = {
      name:this.parentForm.value.name,
      surname:this.parentForm.value.surname,
      relationship:this.parentForm.value.relationship,
      emailAddress:this.parentForm.value.emailAddress,
      phoneNumber:this.parentForm.value.cellPhone,
      child:this.student.email
    }

    const promiseDatabase = this.databases.createDocument(
        'thuto',
        'parents',
        ID.unique(),
        parent
    );
    
    promiseDatabase.then( (response)=> {
        localStorage.setItem('studentID',this.studentForm.value.schoolID||'')
    }, function (error) {
    });


    const promiseAccount = this.account.create(ID.unique(), this.parentForm.value.emailAddress||'', this.parentForm.value.password||'');
    promiseAccount.then((response)=> {
        this.router.navigate(["/top-up"])
    }, function (error) {
    });
  }

}
