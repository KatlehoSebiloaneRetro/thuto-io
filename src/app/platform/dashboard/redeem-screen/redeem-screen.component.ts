import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { Client, Databases, ID, Query } from "appwrite";
import { ReloadlyService } from '../services/Reloadly/reloadly.service';
import { HttpClient } from '@angular/common/http';


interface Denomination {
  label: string;
  value: number;
  description: string;
  productId: number;
}
@Component({
  selector: 'app-redeem-screen',
  templateUrl: './redeem-screen.component.html',
  styleUrls: ['./redeem-screen.component.sass']
})
export class RedeemScreenComponent implements OnInit {

  constructor(
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    private reloadlyService: ReloadlyService,private http:HttpClient
  ) { }

  amountForm = new FormGroup({
    value: new FormControl(0, [Validators.required, Validators.min(5)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)]),
    denomination: new FormControl(null),
    bank: new FormControl(null),
    account_number: new FormControl(null)
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
  balance:any = 0;

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
        { label: "1000 V-Bucks", value: 217.50, description: "1000 V Bucks",productId: 17650  },
        { label: "2800 V-Bucks", value: 508.34, description: "2800 V Bucks",productId: 17804  },
        { label: "5000 V-Bucks", value: 780.44, description: "5000 V Bucks",productId: 17958  },
        { label: "13500 V-Bucks", value: 1741.86, description: "13500 V Bucks",productId: 18112  }
      ]
    },
    {
      image: "../../../../assets/freefire.jpg",
      brand: "Free Fire",
      type: "gaming",
      denominations: [
        { label: "100 + 10 Diamonds", value: 18.92, description: "110 Diamonds",productId: 3300  },
        { label: "210 + 21 Diamonds", value: 37.24, description: "231 Diamonds",productId: 3150  },
        { label: "530 + 53 Diamonds", value: 92.21, description: "583 Diamonds",productId: 3600  },
        { label: "1080 + 108 Diamonds", value: 183.81, description: "1188 Diamonds",productId: 3450  },
        { label: "2200 + 200 Diamonds", value: 367.03, description: "2400 Diamonds",productId: 3750  }
      ]
    },
    {
      image: "../../../../assets/pug_g.jpg",
      brand: "PUBG",
      type: "gaming",
      denominations: [
        { label: "60 UC", value: 34.90, description: "60 UC",productId: 15534  },
        { label: "300 UC", value: 100.21, description: "300 UC",productId: 8775  },
        { label: "600 UC", value: 181.84, description: "600 UC",productId: 9225  }
      ]
    }

  ]


  client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67c5088e003ce7be0f38');

  databases = new Databases(this.client);

/**
 * Calculates the total available Thuto Coins for the student
 * This includes their current balance plus any money they've already spent
 * @returns Promise<number> The total available Thuto Coins
 */
async calculateAvailableThutoCoins(): Promise<number> {
  try {
    // Get the student ID from localStorage
    const studentId = localStorage.getItem('studentID');
    if (!studentId) {
      console.error('No student ID found in localStorage');
      return 0;
    }
    
    // Fetch the student's transactions
    const transactionsResult = await this.databases.listDocuments(
      "thuto",
      "transactions",
      [Query.limit(500), Query.equal('owner', studentId)]
    );
    
    const transactions = this.processArray(transactionsResult.documents);
    
    // Calculate total deposits
    const totalDeposited = transactions.reduce((acc, transaction) => {
      if (transaction.item_purchased === "Parent deposit") {
        return acc + transaction.amount;
      }
      return acc;
    }, 0);
    
    // Calculate spent amount (exclude savings)
    const spent = transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0 &&  
          !transaction.account.includes("sav")) {
        return acc + Math.abs(transaction.amount);
      }
      return acc;
    }, 0);
    
    // Fetch the current TC balance
    const response = await this.http.get<any>(
      `https://thuto.server.nexgenlabs.co.za:6500/score/subject_score`, {
        params: {
          studentId: studentId,
          programId: 'basic_Program',
          depositAmount: totalDeposited.toString()
        }
      }
    ).toPromise();
    
    // Current TC balance + already spent amount = total available
    const tcBalance:any = parseFloat(response || '0');
    this.balance = tcBalance + spent;
    
    return this.balance;
  } catch (error) {
    console.error('Error calculating available Thuto Coins:', error);
    return 0;
  }
}


/**
 * Process array to identify savings transactions
 * @param inputArray The array of transactions
 * @returns Processed array of transactions
 */
processArray(inputArray: any[]) {
  let resultArray = [...inputArray];
  
  for (let i = 0; i < resultArray.length; i++) {
    const currentObject = resultArray[i];
    const currentValue = currentObject.amount;
    
    if (currentValue > 0) {
      const correspondingIndex = resultArray.findIndex(obj => obj.amount === -currentValue);
      
      if (correspondingIndex !== -1) {
        resultArray[i].item_purchased = "saved";
        resultArray[correspondingIndex].item_purchased = "saved";
      }
    }
  }
  
  return resultArray;
}


/**
 * Validates if a transaction is legal based on available balance
 * @param amount The amount to be spent
 * @returns Promise<boolean> Whether the transaction is legal
 */
async validateTransaction(amount: number): Promise<boolean> {
  // Make sure amount is positive for comparison
  const absAmount = Math.abs(amount);
  
  // Get the current available balance if not already calculated
  if (!this.balance) {
    await this.calculateAvailableThutoCoins();
  }
  
  // Check if student has enough balance
  return this.balance >= absAmount;
}


  async ngOnInit(): Promise<void> {
    this.items = this.shopItems;
    try {
      await this.calculateAvailableThutoCoins();

      await this.initializeGamingProducts();
      this.operators = await this.reloadlyService.getOperators();
      this.setupOperatorsMap(this.operators);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  }

  // In your component's ngOnInit:
async initializeGamingProducts() {
  try {
    const products = await this.reloadlyService.getGamingProducts();
    
    // Map to store product info by game name and denomination
    const productMapping: Record<string, Record<string, number>> = {};
    
    // Update shopItems with correct product IDs
    this.shopItems = this.shopItems.map(item => {
      if (item.type === 'gaming') {
        const gameProducts = products.filter(p => 
          p.productName.toLowerCase().includes(item.brand.toLowerCase())
        );
        
        // Create mapping for this game
        productMapping[item.brand] = {};
        
        // Update denominations with correct product IDs
        item.denominations = item.denominations!.map(denom => {
          const matchingProduct = gameProducts.find((p:any) => {
            // Match based on amount or product name
            const amount = parseFloat(denom.description.match(/\d+/)?.[0] || '0');
            return p.fixedRecipientDenominations?.includes(amount) ||
                   p.productName.toLowerCase().includes(denom.description.toLowerCase());
          });

          if (matchingProduct) {
            productMapping[item.brand][denom.description] = matchingProduct.productId;
            return {
              ...denom,
              productId: matchingProduct.productId
            };
          }
          return denom;
        });
      }
      return item;
    });

    
    this.reloadlyService.updateGameProductMapping(productMapping);
    
  } catch (error) {
    console.error('Error initializing gaming products:', error);
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
      // Validate transaction first
      const isValid = await this.validateTransaction(amount);
      if (!isValid) {
        throw new Error('Insufficient Thuto Coins balance');
      }
  
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
          owner: localStorage.getItem('studentID'),
          amount: -1 * amount,
          isInvestment: false,
          date: Date.now().toString(),
          time: Date.now().toString(),
          item_purchased: `${operator.name} Airtime`,
          account: localStorage.getItem('studentID') + ' transactional',
          phoneNumber: phoneNumber,
          transactionId: String(result.transactionId)
        };
  
        await this.databases.createDocument(
          'thuto',
          'transactions',
          ID.unique(),
          purchase
        );
  
        // Update the balance after successful transaction
        this.balance -= amount;
        this.purchased = true;
        this.closeDialog();
      }
    } catch (error: any) {
      console.error('Error purchasing airtime:', error);
      alert(error.message || 'Error purchasing airtime');
    } finally {
      this.loading = false;
    }
  }

// Update makeWithdrawal method
async makeWithdrawal() {
  this.loading = true;
  const amount = this.amountForm.get('value')?.value ?? 0;
  const bankName = this.amountForm.get('bank')?.value ?? 'Not specified';
  const accountNumber = this.amountForm.get('account_number')?.value ?? 'Not specified';
  const studentId = localStorage.getItem('studentID');

  if(amount < 30) {
    alert("Withdrawal amount must be greater than or equal to 30");
    this.loading = false;
    return;
  }

  try {
    // Validate transaction first
    const isValid = await this.validateTransaction(amount);
    if (!isValid) {
      throw new Error('Insufficient Thuto Coins balance');
    }

    // Create transaction record
    const purchase = {
      owner: studentId,
      amount: -1 * amount,
      isInvestment: false,
      date: Date.now().toString(),
      time: Date.now().toString(),
      item_purchased: `bank withdrawal`,
      account: studentId + ' transactional',
      phoneNumber: 'N/A',
      transactionId: "N/A"
    };

    // Create withdrawal request record in the withdrawals collection
    await this.databases.createDocument(
      'thuto',
      '67cb55b90007e6695406', // withdrawals collection ID
      ID.unique(),
      {
        owner: studentId,
        account_number: accountNumber,
        bank: bankName,
        amount: amount.toString() // Convert to string as required by schema
      }
    );

    // Create transaction record
    await this.databases.createDocument(
      'thuto',
      'transactions',
      ID.unique(),
      purchase
    );

    // Update the balance after successful transaction
    this.balance -= amount;
    this.purchased = true;
    
    // Show success message
    alert(`Your withdrawal request for TC${amount} has been submitted. It will be processed within 24-48 business hours.`);
    
    this.closeDialog();
  } catch (error: any) {
    console.error('Error making withdrawal:', error);
    alert(error.message || 'Error making withdrawal');
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
    }
  }



  readonly stringifyDenomination = (item: Denomination): string => 
    `${item.label} - TC ${item.value}`;

  onDenominationChange(event: Denomination): void {
    this.selectedDenomination = event;
    if (event) {
      this.amountForm.patchValue({
        value: event.value
      });
    }
  }

  

  async purchaseGamingVoucher() {
    if (!this.selectedDenomination) {
      alert("Please select a denomination");
      return;
    }
  
    this.loading = true;
    try {
      // Validate transaction first
      const isValid = await this.validateTransaction(this.selectedDenomination.value);
      if (!isValid) {
        throw new Error('Insufficient Thuto Coins balance');
      }
  
      // Get the product ID for the selected game and denomination
      const productId = this.reloadlyService.getGameProductId(
        this.current_item.brand,
        this.selectedDenomination.description
      );
  
      if (!productId) {
        throw new Error('Invalid product selection');
      }
  
      // Create the order on Reloadly
      const orderResult:any = await this.reloadlyService.orderGamingVoucher({
        productId: productId,
        quantity: 1,
        unitPrice: this.selectedDenomination.value,
        recipientEmail:'katleho.b.sebiloane@gmail.com',
        customIdentifier: `${localStorage.getItem('studentID')}_${Date.now()}`
      });
  
      if (!orderResult) {
        throw new Error('No response from voucher purchase');
      }
  
      // Check order status to get the pin
      const orderStatus:any = await this.reloadlyService.checkOrderStatus(orderResult.orderID);
  
      // Create the transaction record
      const purchase = {
        owner: localStorage.getItem('studentID'),
        amount: -1 * this.selectedDenomination.value,
        isInvestment: false,
        date: Date.now().toString(),
        time: Date.now().toString(),
        item_purchased: `${this.current_item.brand} - ${this.selectedDenomination.description}`,
        account: localStorage.getItem('studentID') + ' transactional',
      };
  
      await this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        purchase
      );
  
      // Update the balance after successful transaction
      this.balance -= this.selectedDenomination.value;
      this.purchased = true;
      
      // Show voucher code to user
      if (orderStatus.status === 'SUCCESSFUL') {
        alert(`Your ${this.current_item.brand} voucher code is: ${orderStatus.pin}`);
      } else {
        alert(`Order placed successfully. Status: ${orderStatus.status}`);
      }
      
      this.closeDialog();
    } catch (error: any) {
      console.error('Error purchasing gaming voucher:', error);
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
    if (this.current_item) {
      const operator = this.operatorsMap[this.current_item.brand.toLowerCase()];
    }
  }

  async purchaseItem() {
    let value: number = parseInt(this.amountForm.value.value?.toString() || '0');
    
    try {
      // Validate transaction first
      const isValid = await this.validateTransaction(value);
      if (!isValid) {
        throw new Error('Insufficient Thuto Coins balance');
      }
      
      let purchase = {
        owner: localStorage.getItem('studentID'),
        amount: -1 * value,
        isInvestment: false,
        date: Date.now().toString(),
        time: Date.now().toString(),
        item_purchased: this.current_item.brand,
        account: localStorage.getItem('studentID') + " transactional"
      };
  
      await this.databases.createDocument(
        'thuto',
        'transactions',
        ID.unique(),
        purchase
      );
      
      // Update the balance after successful transaction
      this.balance -= value;
      this.purchased = true;
      this.closeDialog();
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      alert(error.message || 'Error purchasing item');
    }
  }
  

  showDialog(content: any): void {
    this.subscription = this.dialogs.open(content,{dismissible: content}).subscribe();
}

closeDialog():void{
  this.subscription.unsubscribe()
}


}
