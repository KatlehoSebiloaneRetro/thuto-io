import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.sass']
})
export class BottomMenuComponent implements OnInit {

  currentRoute: string = '';
  activeColor: string = '#007AFF'; // Or any color you prefer for active state

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event:any) => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit(): void {
    this.currentRoute = this.router.url;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

}
