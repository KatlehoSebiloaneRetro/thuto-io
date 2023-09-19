import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.sass']
})
export class FeatureComponent implements OnInit {

  constructor() { }
  @Input() value:any
  @Input() isWhite:any = "white"
  @Input() isfeature:any
  
  ngOnInit(): void {
  }

}
