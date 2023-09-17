import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.sass']
})
export class TextComponent implements OnInit {

  constructor() { }

  @Input() value:any

  ngOnInit(): void {
  }

}
