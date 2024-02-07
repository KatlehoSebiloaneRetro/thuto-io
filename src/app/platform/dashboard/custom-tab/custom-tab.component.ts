import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-tab',
  templateUrl: './custom-tab.component.html',
  styleUrls: ['./custom-tab.component.sass']
})
export class CustomTabComponent implements OnInit {

  @Input()
  items:any

  @Input()
  isProgram:any = true

  onClick(item:any){
    item.function()
  }
  

  constructor() { }

  ngOnInit(): void {
  }

}
