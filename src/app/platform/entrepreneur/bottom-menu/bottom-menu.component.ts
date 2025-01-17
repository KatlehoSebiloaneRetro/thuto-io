import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.sass']
})
export class BottomMenuComponent implements OnInit {

  constructor() { }

  readonly items = [
    {
        text: 'Favorites',
        icon: 'tuiIconHeartLarge',
        path: '/dash',
    },
    {
        text: 'Calls',
        icon: 'tuiIconPhoneLarge',
        path: '/transactions',
    },
    {
        text: 'Profile',
        icon: 'tuiIconUserLarge',
        path: '/program',
    }
];

  ngOnInit(): void {
  }

}
