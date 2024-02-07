import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.sass']
})
export class TransactionComponent implements OnInit {

  @Input() transaction:any
  constructor() { }

  date:any
  isSavings:boolean =false

  ngOnInit(): void {
    this.date = new Date(parseInt(this.transaction.date)).toISOString().split("T")[0]
    if(this.transaction.account.toLowerCase().includes('saving')){
      this.isSavings=true;
    }
  }

}
