import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

interface ReloadlyOperator {
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

@Injectable({
  providedIn: 'root'
})
export class ReloadlyService {
  private readonly baseUrl = 'https://topups-sandbox.reloadly.com';
  private readonly apiUrl = 'https://giftcards-sandbox.reloadly.com';
  private readonly authUrl = 'https://auth.reloadly.com/oauth/token';
  giftcardsToken:any

  constructor(private http: HttpClient) {}

  
  private async getAccessToken(): Promise<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const body = {
      client_id: environment.reloadlyClientId,
      client_secret: environment.reloadlyClientSecret,
      grant_type: 'client_credentials',
      audience: this.baseUrl
    };

    try {
      console.log('Requesting Reloadly access token...');
      const response: any = await firstValueFrom(
        this.http.post(this.authUrl, body, { headers })
      );
      console.log('Access token received successfully');
      return response.access_token;
    } catch (error) {
      console.error('Failed to get Reloadly access token:', error);
      throw error;
    }
  }

  async getOperators(countryCode: string = 'ZA'): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      // Update headers to include all required fields
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json', // This is the key change
        'Content-Type': 'application/json'
      });

      console.log(`Fetching operators for country: ${countryCode}`);
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/operators/countries/${countryCode}`, { headers })
      );

      console.log('Operators response:', response);
      return response as any[];
    } catch (error) {
      console.error('Failed to fetch operators:', error);
      throw error;
    }
  }

  async topup(phoneNumber: string, amount: number, operatorId: number): Promise<any> {
    try {
      const token = await this.getAccessToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json',
        'Content-Type': 'application/json'
      });

      const body = {
        operatorId: operatorId,
        amount: amount,
        useLocalAmount: true,
        recipientPhone: {
          countryCode: 'ZA',
          number: phoneNumber
        }
      };

      console.log('Initiating topup:', body);

      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/topups`, body, { headers })
      );

      console.log('Topup response:', response);
      return response;
    } catch (error) {
      console.error('Topup failed:', error);
      throw error;
    }
  }


  //gaming related stuff here

  private async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private async getGiftcardsToken(): Promise<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const body = {
      client_id: environment.reloadlyClientId,
      client_secret: environment.reloadlyClientSecret,
      grant_type: 'client_credentials',
      audience: 'https://giftcards.reloadly.com'
    };

    try {
      console.log('Requesting Reloadly giftcards access token...');
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, body, { headers })
      );
      console.log('Giftcards access token received successfully');
      this.giftcardsToken = response.access_token;
      return this.giftcardsToken;
    } catch (error) {
      console.error('Failed to get Reloadly giftcards token:', error);
      throw error;
    }
  }

  async orderGamingVoucher(data: {
    productId: number,
    quantity: number,
    unitPrice: number,
    customIdentifier?: string
  }) {
    try {
      const token = await this.getGiftcardsToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      console.log('Ordering gaming voucher...');
      console.log('Request URL:', `${this.apiUrl}/api/v1/orders`);
      console.log('Request Body:', data);
      
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/api/v1/orders`, {
          productId: data.productId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          customIdentifier: data.customIdentifier,
          senderName: 'Thuto App'
        }, { headers })
      );
      
      return response;
    } catch (error) {
      console.error('Error ordering gaming voucher:', error);
      throw error;
    }
  }


  async getGamingProducts(countryCode: string = 'ZA') {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await firstValueFrom(
        this.http.get(
          `${this.apiUrl}/api/v1/products?countryCode=${countryCode}`,
          { headers }
        )
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching gaming products:', error);
      throw error;
    }
  }

  async checkOrderStatus(orderId: string) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await firstValueFrom(
        this.http.get(
          `${this.apiUrl}/api/v1/orders/${orderId}`,
          { headers }
        )
      );
      
      return response;
    } catch (error) {
      console.error('Error checking order status:', error);
      throw error;
    }
  }


  async getGamingVoucherProducts(gameCode: string) {
    try {
      const response = await this.http.get(`${this.apiUrl}/gaming-products/${gameCode}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching gaming products:', error);
      throw error;
    }
  }

  
  // Add this method to get product mappings
  getGameProductId(game: string, denomination: string): number {
    const productMappings:any = {
      'Fortnite': {
        '1000 V Bucks': 66,
        '2800 V Bucks': 67,
        '5000 V Bucks': 68,
        '13500 V Bucks': 69
      },
      'Free Fire': {
        '110 Diamonds': 70,
        '231 Diamonds': 71,
        '583 Diamonds': 72,
        '1188 Diamonds': 73,
        '2400 Diamonds': 74
      },
      'PUBG': {
        '60 UC': 75,
        '300 UC': 76,
        '600 UC': 77
      }
    };
  
    return productMappings[game]?.[denomination] || null;
  }



  // Helper method to get operator details
  async getOperatorById(operatorId: number): Promise<ReloadlyOperator | undefined> {
    const operators = await this.getOperators();
    return operators.find(op => op.id === operatorId);
  }

  // Utility method to format phone number
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters except +
    return phoneNumber.replace(/[^\d+]/g, '');
  }
}