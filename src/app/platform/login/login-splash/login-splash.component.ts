import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-login-splash',
  templateUrl: './login-splash.component.html',
  styleUrls: ['./login-splash.component.sass']
})
export class LoginSplashComponent implements OnInit {

  index = 0;
 
  readonly items = [
      'John Cleese',
      'Eric Idle',
      'Michael Palin',
      'Graham Chapman',
      'Terry Gilliam',
      'Terry Jones',
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
