import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.sass']
})
export class ReviewComponent implements OnInit {

  constructor() { }

  @Input() value:any
  ngOnInit(): void {
  }

}
