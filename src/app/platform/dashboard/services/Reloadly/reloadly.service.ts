import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

interface ProductDetails {
  productId: number;
  productName: string;
  global: boolean;
  recipientCurrencyCode: string;
  senderCurrencyCode: string;
  denominationType: string;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations: number[];
  fixedRecipientToSenderDenominationsMap: Record<string, number>;
}

interface OrderRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
  customIdentifier?: string;
  recipientEmail?: string;
  recipientPhoneDetails?: {
    countryCode: string;
    phoneNumber: string;
  };
}

// Types for the service
export interface ReloadlyOperator {
  id: number;
  name: string;
  bundle: boolean;
  data: boolean;
  pin: boolean;
  supports_local_amounts: boolean;
  denomination_type: string;
  sender_currency_code: string;
  sender_currency_symbol: string;
  destination_currency_code: string;
  destination_currency_symbol: string;
  most_popular_amount: number;
  min_amount: number;
  max_amount: number;
  local_min_amount: number;
  local_max_amount: number;
  country: {
    iso_code: string;
    name: string;
    currency_code: string;
    currency_name: string;
    currency_symbol: string;
  };
}

export interface TopUpRequest {
  operatorId: number;
  amount: number;
  useLocalAmount: boolean;
  recipientPhone: {
    countryCode: string;
    number: string;
  };
}

export interface GamingVoucherOrder {
  productId: number;
  quantity: number;
  unitPrice: number;
  customIdentifier?: string;
  senderName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReloadlyService {
  private readonly baseUrl = 'https://topups.reloadly.com';
  private readonly giftcardsUrl = 'https://giftcards.reloadly.com';
  private readonly authUrl = 'https://auth.reloadly.com/oauth/token';
  
  private topupsToken: string | null = null;
  private giftcardsToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private http: HttpClient) {}

  private async getGiftcardsToken(){
    if (this.giftcardsToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.giftcardsToken;
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  
    // According to documentation, this is the exact format needed
    const body = {
      client_id: environment.reloadlyClientId,
      client_secret: environment.reloadlyClientSecret,
      grant_type: 'client_credentials',
      audience: 'https://giftcards.reloadly.com'
    };
  
    try {
  
      const response: any = await firstValueFrom(
        this.http.post(this.authUrl, body, { headers })
      );
      
      
      this.tokenExpiry = new Date(Date.now() + (response.expires_in - 300) * 1000);
      this.giftcardsToken = response.access_token;
      
      return this.giftcardsToken;
    } catch (error) {
      console.error('Failed to get Reloadly giftcards token:', error);
      if (error instanceof HttpErrorResponse) {
        console.error('Error details:', error.error);
      }
      throw this.handleError(error);
    }
  }
  
  private async getTopupsToken() {
    if (this.topupsToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.topupsToken;
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  
    const body = {
      client_id: environment.reloadlyClientId,
      client_secret: environment.reloadlyClientSecret,
      grant_type: 'client_credentials',
      audience: 'https://topups.reloadly.com' 
    };
  
    try {
      const response: any = await firstValueFrom(
        this.http.post(this.authUrl, body, { headers })
      );
      
      this.tokenExpiry = new Date(Date.now() + (response.expires_in - 300) * 1000);
      this.topupsToken = response.access_token;
      
      return this.topupsToken;
    } catch (error) {
      console.error('Failed to get Reloadly topups token:', error);
      throw this.handleError(error);
    }
  }


  // Airtime/Topup Methods
  async getOperators(countryCode: string = 'ZA'): Promise<ReloadlyOperator[]> {
    try {
      const token = await this.getTopupsToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json',
        'Content-Type': 'application/json'
      });

      const response = await firstValueFrom(
        this.http.get<ReloadlyOperator[]>(
          `${this.baseUrl}/operators/countries/${countryCode}`,
          { headers }
        )
      );

      return response;
    } catch (error) {
      console.error('Failed to fetch operators:', error);
      throw this.handleError(error);
    }
  }

  async getOperatorById(operatorId: number): Promise<ReloadlyOperator | undefined> {
    try {
      const operators = await this.getOperators();
      return operators.find(op => op.id === operatorId);
    } catch (error) {
      console.error('Failed to get operator by ID:', error);
      throw this.handleError(error);
    }
  }

  async topup(phoneNumber: string, amount: number, operatorId: number): Promise<any> {
    try {
      const token = await this.getTopupsToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json',
        'Content-Type': 'application/json'
      });

      const body: TopUpRequest = {
        operatorId: operatorId,
        amount: amount,
        useLocalAmount: true,
        recipientPhone: {
          countryCode: 'ZA',
          number: this.formatPhoneNumber(phoneNumber)
        }
      };

      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/topups`, body, { headers })
      );

      return response;
    } catch (error) {
      console.error('Topup failed:', error);
      throw this.handleError(error);
    }
  }

  async checkOrderStatus(orderId: string): Promise<any> {
    try {
      const token = await this.getGiftcardsToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.giftcards-v1+json'
      });
  
      const response:any = await firstValueFrom(
        this.http.get(
          `${this.giftcardsUrl}/orders/transactions/${orderId}/cards`,
          { headers }
        )
      );
  
      return {
        status: 'SUCCESSFUL',
        cardNumber: response.cardNumber,
        pinCode: response.pinCode,
        ...response
      };
    } catch (error) {
      console.error('Error checking order status:', error);
      throw this.handleError(error);
    }
  }
  

  
  async getRedeemInstructions(brandId: number): Promise<any> {
    try {
      const token = await this.getGiftcardsToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });
  
      return await firstValueFrom(
        this.http.get(
          `${this.giftcardsUrl}/redeem-instructions/${brandId}`,
          { headers }
        )
      );
    } catch (error) {
      console.error('Error fetching redeem instructions:', error);
      throw this.handleError(error);
    }
  }

  
  async getGamingProducts(countryCode: string = 'ZA'): Promise<any[]> {
    try {
      const token = await this.getGiftcardsToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.giftcards-v1+json'
      });
  
      // Add query parameters to filter gaming products
      const params = new HttpParams()
        .set('countryCode', countryCode)
        .set('size', '50')  // Adjust size as needed
        .set('productName', '')  // Can filter by name if needed
        .set('includeRange', 'true')
        .set('includeFixed', 'true');
  
      const response = await firstValueFrom(
        this.http.get<any[]>(
          `${this.giftcardsUrl}/products`,
          { headers, params }
        )
      );
  
      return response;
    } catch (error) {
      console.error('Error fetching gaming products:', error);
      throw this.handleError(error);
    }
  } 

  // Add to ReloadlyService:
private productMapping: Record<string, Record<string, number>> = {};

updateGameProductMapping(mapping: Record<string, Record<string, number>>) {
  this.productMapping = mapping;
}

// In ReloadlyService

async validateProductIds(): Promise<void> {
  try {
    const products = await this.getGamingProducts();

    // Create a set of all valid product IDs from the API
    const validProductIds = new Set(products.map(p => p.productId));

    // List of our product IDs for validation
    const ourProductIds = [
      // Fortnite
      17650, 17804, 17958, 18112,
      // Free Fire
      3300, 3150, 3600, 3450, 3750,
      // PUBG
      15534, 8775, 9225
    ];

    // Check each ID
    const invalidIds = ourProductIds.filter(id => !validProductIds.has(id));
    
    if (invalidIds.length > 0) {
      console.warn('Warning: The following product IDs are not found in Reloadly:', invalidIds);
    } else {
    }

    // Log product details for reference
    ourProductIds.forEach(id => {
      const product = products.find(p => p.productId === id);
      if (product) {
      }
    });

  } catch (error) {
    console.error('Error validating product IDs:', error);
  }
}

getGameProductId(game: string, denomination: string): number | null {
  const gameProductMappings:any = {
    'Fortnite': {
      '1000 V Bucks': 17650,
      '2800 V Bucks': 17804,
      '5000 V Bucks': 17958,
      '13500 V Bucks': 18112
    },
    'Free Fire': {
      '110 Diamonds': 3300,
      '231 Diamonds': 3150,
      '583 Diamonds': 3600,
      '1188 Diamonds': 3450,
      '2400 Diamonds': 3750
    },
    'PUBG': {
      '60 UC': 15534,
      '300 UC': 8775,
      '600 UC': 9225
    }
  };

  return gameProductMappings[game]?.[denomination] ?? null;
}



async getProductDetails(productId: number): Promise<ProductDetails> {
  try {
    const token = await this.getGiftcardsToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/com.reloadly.giftcards-v1+json'
    });

    const response = await firstValueFrom(
      this.http.get<ProductDetails>(
        `${this.giftcardsUrl}/products/${productId}`,
        { headers }
      )
    );

    return response;
  } catch (error) {
    console.error('Error getting product details:', error);
    throw this.handleError(error);
  }
}

async validateAndGetOrderPrice(productId: number, localAmount: number): Promise<number> {
  const details = await this.getProductDetails(productId);
  
  // Find the matching USD denomination
  const usdAmount = details.fixedRecipientDenominations.find(amount => {
    // Get the corresponding local amount from the mapping
    const localEquivalent = details.fixedRecipientToSenderDenominationsMap[amount.toFixed(2)];
    // Allow for small difference in floating point comparison
    return Math.abs(localEquivalent - localAmount) < 0.01;
  });

  if (!usdAmount) {
    const validPrices = details.fixedRecipientToSenderDenominationsMap;
    throw new Error(
      `Invalid amount. Valid prices in ${details.senderCurrencyCode} are: ` +
      `${Object.values(validPrices).join(', ')}`
    );
  }

  return usdAmount;
}

async orderGamingVoucher(data: {
  productId: number;
  quantity: number;
  unitPrice: number;
  customIdentifier?: string;
  recipientEmail?: string;
}): Promise<any> {
  try {
    // Get the correct USD price for the order
    const usdPrice = await this.validateAndGetOrderPrice(data.productId, data.unitPrice);
    
    const token = await this.getGiftcardsToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/com.reloadly.giftcards-v1+json'
    });

    const orderData = {
      productId: data.productId,
      countryCode: 'ZA',
      quantity: data.quantity,
      unitPrice: usdPrice,  // Using validated USD price
      customIdentifier: data.customIdentifier || `order_${Date.now()}`,
      senderName: 'Thuto App',
      recipientEmail: data.recipientEmail || null
    };

    const response:any = await firstValueFrom(
      this.http.post(
        `${this.giftcardsUrl}/orders`,
        orderData,
        { headers }
      )
    );

    return {
      orderID: response.transactionId,
      status: response.status,
      amount: response.amount,
      currencyCode: response.currencyCode,
      discount: response.discount,
      fee: response.fee,
      recipientEmail: response.recipientEmail,
      transactionCreatedTime: response.transactionCreatedTime,
      ...response
    };
  } catch (error) {
    console.error('Error ordering gaming voucher:', error);
    if (error instanceof HttpErrorResponse) {
      const errorMessage = error.error?.message || 'Failed to order voucher';
      throw new Error(errorMessage);
    }
    throw error;
  }
}

  // Utility Methods
  private handleError(error: any): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        // Clear tokens on authentication error
        this.topupsToken = null;
        this.giftcardsToken = null;
        this.tokenExpiry = null;
        return new Error('Authentication failed. Please try again.');
      }
      
      if (error.error?.message) {
        return new Error(error.error.message);
      }
    }
    
    return error instanceof Error ? error : new Error('An unknown error occurred');
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters except +
    return phoneNumber.replace(/[^\d+]/g, '');
  }
}