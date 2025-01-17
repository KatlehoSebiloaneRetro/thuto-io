import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-subject-stat',
  templateUrl: './subject-stat.component.html',
  styleUrls: ['./subject-stat.component.sass']
})
export class SubjectStatComponent implements OnInit {

  constructor() { }
  @Input() stats:any
  ngOnInit(): void {
  }


  

}
