import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeachPaymentService {
  private AUTH_URL = 'https://sandbox-dashboard.peachpayments.com/api/oauth/token';
  private CHECKOUT_URL = 'https://testsecure.peachpayments.com/v2/checkout';
  
  public readonly CLIENT_ID = 'b45955c147ad955e831c5bfc912b4f';
  public readonly CLIENT_SECRET = 'EEeNk6W7jv8rg1S+DP4QbTY2rGL4dmFM3eqZ5Nm0WKRpfMrcf6f3IJ2NHW2wN4pCJh912u3XLFkg9tZ5bKQS4w==';
  public readonly MERCHANT_ID = 'cb508133c87a418ca105a194b787185a';
  public readonly ENTITY_ID = '8ac7a4c9943d9fd4019440be3f110581';

  constructor(private http: HttpClient) {}

  async getAuthToken(): Promise<string> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    const body = {
      clientId: this.CLIENT_ID,
      clientSecret: this.CLIENT_SECRET,
      merchantId: this.MERCHANT_ID
    };

    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.AUTH_URL, body, { headers })
      );
      return response.token;
    } catch (error) {
      console.error('Auth token error:', error);
      throw error;
    }
  }

  async createCheckout(amount: number): Promise<string> {
    const token = await this.getAuthToken();
    
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const nonce = this.generateNonce();
    
    const checkoutData = {
      amount: amount.toFixed(2),
      currency: 'ZAR',
      nonce: nonce,
      // Add other required checkout parameters here
    };

    try {
      const response = await firstValueFrom(
        this.http.post<any>(this.CHECKOUT_URL, checkoutData, { headers })
      );
      return response.checkoutId;
    } catch (error) {
      console.error('Checkout creation error:', error);
      throw error;
    }
  }

  private generateNonce(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}