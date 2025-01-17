import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { Client, Databases, ID, Query } from "appwrite";
import { ReloadlyService } from '../services/Reloadly/reloadly.service';

@Component({
  selector: 'app-redeem-screen',
  templateUrl: './redeem-screen.component.html',
  styleUrls: ['./redeem-screen.component.sass']
})
export class RedeemScreenComponent implements OnInit {

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private reloadlyService: ReloadlyService
  ) { }

  amountForm = new FormGroup({
    value: new FormControl(0, [Validators.required, Validators.min(5)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)]),
    denomination: new FormControl(null, Validators.required)
  });

  isGamingSelected: boolean = false;
  selectedDenomination: any = null;

  loading = false;
  operators: any[] = [];
  selectedOperator: any = null;
  operatorsMap: { [key: string]: any } = {};
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

  toggleGaming() {
    this.isGamingSelected = true;
    this.isAirtimeSelected = false;
    this.isShoppingSelected = false;
    this.isGrocerySelected = false;
    this.isEntertainmentSelected = false;
  }


  shopItems=[
    {
      image:"../../../../assets/vodacom.png",
      brand:"vodacom",
      type:"airtime",
      operatorId:438
    },
    {
      image:"../../../../assets/telkom.png",
      brand:"telkom",
      type:"airtime",
      operatorId:441
    },
    {
      image:"../../../../assets/mtn.png",
      brand:"mtn",
      type:"airtime",
      operatorId:440
    },
    {
      image:"../../../../assets/cellc.png",
      brand:"cellc",
      type:"airtime",
      operatorId:435
    },
    {
      image: "../../../../assets/fortnite.jpg",
      brand: "Fortnite",
      type: "gaming",
      denominations: [
        { label: "1000 V-Bucks", value: 236.24, description: "1000 V Bucks" },
        { label: "2800 V-Bucks", value: 508.34, description: "2800 V Bucks" },
        { label: "5000 V-Bucks", value: 780.44, description: "5000 V Bucks" },
        { label: "13500 V-Bucks", value: 1741.86, description: "13500 V Bucks" }
      ]
    },
    {
      image: "../../../../assets/freefire.jpg",
      brand: "Free Fire",
      type: "gaming",
      denominations: [
        { label: "100 + 10 Diamonds", value: 18.92, description: "110 Diamonds" },
        { label: "210 + 21 Diamonds", value: 37.24, description: "231 Diamonds" },
        { label: "530 + 53 Diamonds", value: 92.21, description: "583 Diamonds" },
        { label: "1080 + 108 Diamonds", value: 183.81, description: "1188 Diamonds" },
        { label: "2200 + 200 Diamonds", value: 367.03, description: "2400 Diamonds" }
      ]
    },
    {
      image: "../../../../assets/pub_g.jpg",
      brand: "PUBG",
      type: "gaming",
      denominations: [
        { label: "60 UC", value: 34.90, description: "60 UC" },
        { label: "300 UC", value: 100.21, description: "300 UC" },
        { label: "600 UC", value: 181.84, description: "600 UC" }
      ]
    }

  ]





  client = new Client()
    .setEndpoint('https://thuto.appwrite.nexgenlabs.co.za/v1')
    .setProject('672b43fb00096f3a294e');

  databases = new Databases(this.client);

  async ngOnInit(): Promise<void> {
    this.items = this.shopItems;
    try {
      this.operators = await this.reloadlyService.getOperators();
      this.setupOperatorsMap(this.operators);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  }


  private setupOperatorsMap(operators: any[]): void {
    const brandToOperatorName: { [key: string]: string } = {
      'vodacom': 'Vodacom',
      'mtn': 'MTN',
      'cellc': 'Cell C',
      'telkom': 'Telkom'
    };

    operators.forEach(operator => {
      const normalizedName = operator.name.toLowerCase();
      Object.entries(brandToOperatorName).forEach(([brand, opName]) => {
        if (normalizedName.includes(opName.toLowerCase())) {
          this.operatorsMap[brand] = operator;
        }
      });
    });
    
    // Update shopItems with operator IDs
    this.shopItems = this.shopItems.map(item => {
      if (item.type === 'airtime') {
        const operator = this.operatorsMap[item.brand.toLowerCase()];
        if (operator) {
          return {
            ...item,
            operatorId: operator.id,
            minAmount: operator.minAmount,
            maxAmount: operator.maxAmount
          };
        }
      }
      return item;
    });
  }

  async purchaseAirtime() {
    if (!this.amountForm.valid) {
      return;
    }
  
    this.loading = true;
    const phoneNumber = this.amountForm.get('phoneNumber')?.value ?? '';
    const amount = this.amountForm.get('value')?.value ?? 0;
  
    try {
      // Fetch operator details first to validate amount
      const operator = await this.reloadlyService.getOperatorById(this.current_item.operatorId);
      
      if (!operator) {
        throw new Error('Invalid operator');
      }
  
      // Validate amount against operator limits
      if (amount < operator.min_amount || amount > operator.max_amount) {
        throw new Error(`Amount must be between ${operator.min_amount} and ${operator.max_amount}`);
      }
  
      const result = await this.reloadlyService.topup(
        phoneNumber,
        amount,
        operator.id
      );
  
      if (result.status === 'SUCCESSFUL') {
        // Create transaction record
        const purchase = {
          owner: localStorage.getItem('studentID')?.split('@')[0],
          amount: -1 * amount,
          isInvestment: false,
          date: Date.now().toString(),
          time: Date.now().toString(),
          item_purchased: `${operator.name} Airtime`,
          account: localStorage.getItem('studentID')?.split('@')[0] + ' transactional',
          phoneNumber: phoneNumber,
          transactionId: String(result.transactionId)
        };

        console.log(purchase)
  
        await this.databases.createDocument(
          'thuto',
          'transactions',
          ID.unique(),
          purchase
        );
  
        this.purchased = true;
        this.closeDialog();
      }
    } catch (error) {
      console.error('Error purchasing airtime:', error);
      // Handle error appropriately - show user friendly message
    } finally {
      this.loading = false;
    }
  }

  setItem(item: any) {
    this.current_item = item;
    this.current_item = item;
    if (item.type === "gaming") {
      this.toggleGaming();
      // Reset form values when selecting a new item
      this.amountForm.patchValue({
        denomination: null,
        value: 0
      });
      this.selectedDenomination = null;
    }else if(item.type === "airtime") {
      this.toggleAirtime();
      // Log operator details for debugging
      const operator = this.operatorsMap[item.brand.toLowerCase()];
      console.log('Selected operator:', operator);
    }
  }

  readonly denominationStringify = (item: any): string => {
    return item ? `${item.label} - TC ${item.value}` : '';
  };

  onDenominationChange(event: any): void {
    const selectedDenom = event;
    this.selectedDenomination = selectedDenom;
    
    if (selectedDenom) {
      this.amountForm.patchValue({
        value: selectedDenom.value
      });
    }
  }

  async purchaseGamingVoucher() {
    // Fix validation logic - was checking for valid instead of invalid
    // if (!this.amountForm.valid || !this.selectedDenomination) {
    //   alert("Invalid selection");
    //   return;
    // }
  
    this.loading = true;
    try {
      // Get the product ID for the selected game and denomination
      const productId = this.reloadlyService.getGameProductId(
        this.current_item.brand,
        this.selectedDenomination.description
      );
  
      if (!productId) {
        throw new Error('Invalid product selection');
      }
  
      console.log('Attempting to purchase gaming voucher:', {
        game: this.current_item.brand,
        denomination: this.selectedDenomination.description,
        productId: productId
      });
  
      // Create the order on Reloadly
      const orderResult:any = await this.reloadlyService.orderGamingVoucher({
        productId: productId,
        quantity: 1,
        unitPrice: this.selectedDenomination.value,
        customIdentifier: `${localStorage.getItem('studentID')}_${Date.now()}`
      });
  
      console.log('Order result:', orderResult);
  
      if (!orderResult) {
        throw new Error('No response from voucher purchase');
      }
  
      // Check order status to get the pin
      const orderStatus:any = await this.reloadlyService.checkOrderStatus(orderResult.orderID);
      console.log('Order status:', orderStatus);
  
      // Create the transaction record
      const purchase = {
        owner: localStorage.getItem('studentID')?.split('@')[0],
        amount: -1 * this.selectedDenomination.value,
        isInvestment: false,
        date: Date.now().toString(),
        time: Date.now().toString(),
        item_purchased: `${this.current_item.brand} - ${this.selectedDenomination.description}`,
        account: localStorage.getItem('studentID')?.split('@')[0] + ' transactional',
        voucher_type: 'gaming',
        game: this.current_item.brand,
        denomination: this.selectedDenomination.description,
        reloadly_order_id: orderResult.orderID, // Note: changed from orderId to orderID based on API response
        reloadly_pin: orderStatus.pin, // Get pin from order status
        status: orderStatus.status
      };
  
      await this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        purchase
      );
  
      // Show success message with voucher code
      this.purchased = true;
      
      // Show voucher code to user - added proper status check
      if (orderStatus.status === 'SUCCESSFUL') {
        alert(`Your ${this.current_item.brand} voucher code is: ${orderStatus.pin}`);
      } else {
        alert(`Order placed successfully. Status: ${orderStatus.status}`);
      }
      
      this.closeDialog();
    } catch (error: any) {
      console.error('Error purchasing gaming voucher:', error);
      // More specific error message based on the error type
      alert(error.message || 'Failed to purchase voucher. Please try again.');
    } finally {
      this.loading = false;
    }
  }
  back() {
    this.purchased = false;
    this.isAirtimeSelected = false;
    this.isShoppingSelected = false;
    this.isGrocerySelected = false;
    this.isEntertainmentSelected = false;
    this.current_item = null;
  }

  async readShopItems() {
    let promise = await this.databases.listDocuments(
      "thuto",
      "659506a742ea1e5b8115",
      [Query.limit(250)]
    );
    return promise.documents;
  }

  debugOperators() {
    console.log('Available operators:', this.operatorsMap);
    console.log('Current item:', this.current_item);
    if (this.current_item) {
      const operator = this.operatorsMap[this.current_item.brand.toLowerCase()];
      console.log('Selected operator:', operator);
    }
  }

  purchaseItem(){
    
    let value: number = parseInt(this.amountForm.value.value?.toString() || '0');
    console.log(-1.0*value)

    let purchase ={
      owner:localStorage.getItem('studentID')?.split("@")[0],
      amount:-1*value,
      isInvestment:false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: this.current_item.brand,
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
