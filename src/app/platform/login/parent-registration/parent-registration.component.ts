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
  .setEndpoint('https://appwrite.flowspaceproducitivity.com/v1')
  .setProject('654ef9645b3a060ec136');

  databases = new Databases(this.client);
  account = new Account(this.client);
  student:any

  async ReadStudent(studentValue:any){
    let promise = await this.databases.listDocuments(
      "654ef9a9319f62f3952c",
      "659500443605a8e23728",
      [Query.equal('email',studentValue)]
    )
    return promise.documents[0];
  }

  async ngOnInit(): Promise<void> {
    
  }

  async checkStudent(){
    console.log('running check')
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
      console.log(this.studentForm)
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
        '654ef9a9319f62f3952c',
        '6595003dbcd19860aff5',
        ID.unique(),
        parent
    );
    
    promiseDatabase.then( (response)=> {
        localStorage.setItem('studentID',this.studentForm.value.schoolID||'')
        console.log(response);
    }, function (error) {
        console.log(error);
    });


    const promiseAccount = this.account.create(ID.unique(), this.parentForm.value.emailAddress||'', this.parentForm.value.password||'');
    promiseAccount.then((response)=> {
        console.log(response);
        this.router.navigate(["/top-up"])
    }, function (error) {
        console.log(error);
    });
  }

}
