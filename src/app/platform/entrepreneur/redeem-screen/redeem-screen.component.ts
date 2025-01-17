import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { Client, Databases, ID, Query } from "appwrite";

@Component({
  selector: 'app-redeem-screen',
  templateUrl: './redeem-screen.component.html',
  styleUrls: ['./redeem-screen.component.sass']
})
export class  EntRedeemScreenComponent implements OnInit {

  constructor(@Inject(TuiDialogService) private readonly dialogs: TuiDialogService) { }

  amountForm = new FormGroup({
    value: new FormControl(0),
  });
  items:any
  subscription:any

  purchased:boolean = false;
  
  isAirtimeSelected:boolean = false
  isShoppingSelected:boolean = false
  isGrocerySelected:boolean = false
  isEntertainmentSelected:boolean = false
  current_item:any

  toggleAirtime(){
    this.isAirtimeSelected = true
    this.isShoppingSelected = false
    this.isGrocerySelected = false
    this.isEntertainmentSelected = false
  }

  toggleShopping(){
    this.isShoppingSelected = true
    this.isAirtimeSelected = false
    this.isGrocerySelected = false
    this.isEntertainmentSelected = false

  }

  toggleGroceries(){
    this.isGrocerySelected = true
    this.isAirtimeSelected = false
    this.isShoppingSelected = false
    this.isEntertainmentSelected = false
  }

  toggleEntertainment(){
    this.isEntertainmentSelected = true
    this.isAirtimeSelected = false
    this.isShoppingSelected = false
    this.isGrocerySelected = false
  }

  setItem(item:any){
    this.current_item = item
    if(item.type =="entertainment"){
      this.toggleEntertainment()
    }
    if(item.type =="shopping"){
      this.toggleShopping()
    }
    if(item.type =="grocery"){
      this.toggleGroceries()
    }
    if(item.type =="airtime"){
      this.toggleAirtime()
    }
  }

  back(){
    this.purchased = false
    this.isAirtimeSelected= false
    this.isShoppingSelected= false
    this.isGrocerySelected= false
    this.isEntertainmentSelected = false
    this.current_item = null
  }



  client = new Client()
    .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
    .setProject('672b43fb00096f3a294e');

  databases = new Databases(this.client);

  async ngOnInit(): Promise<void> {
    this.items = await this.readShopItems()
    console.log(this.items)
  }

  async readShopItems(){
    let promise = await this.databases.listDocuments(
      "thuto",
      "659506a742ea1e5b8115",
      [Query.limit(250)]
    )
    return promise.documents;
  }


  purchaseItem(){
    
    let value:number = this.amountForm.value.value || 0
    let purchase ={
      owner:localStorage.getItem('studentID')?.split("@")[0],
      amount:-1*value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: "bank withdrawal",
      account:localStorage.getItem('studentID')?.split("@")[0]+" transactional"
    }

    const promise1 = this.databases.createDocument(
      'thuto',
      'transactions',
      ID.unique(),
      purchase
  );

    promise1.then((response)=> {
      this.purchased = true
      this.closeDialog()
      
      console.log(response);
      
  }, function (error) {
      console.log(error);
  });
  
  }

  showDialog(content: any): void {
    this.subscription = this.dialogs.open(content,{dismissible: content}).subscribe();
}

closeDialog():void{
  this.subscription.unsubscribe()
}


}
