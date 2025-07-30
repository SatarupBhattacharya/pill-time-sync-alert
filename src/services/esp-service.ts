import { PillData } from '@/types/pill-monitor';
import { CapacitorHttp } from '@capacitor/core';

// Check if running in native app
const isNative = () => {
  return typeof window !== 'undefined' && 
         (window as any).Capacitor && 
         (window as any).Capacitor.isNativePlatform();
};

export class ESPService {
  private baseUrl: string;

  constructor(espIP: string = '192.168.1.100') {
    this.baseUrl = `http://${espIP}`;
  }

  async setAlarm(dose: number, hour: number, minute: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/setalarm?dose=${dose}&hh=${hour}&mm=${minute}`);
      return response.ok;
    } catch (error) {
      console.error('Failed to set alarm:', error);
      return false;
    }
  }

  async setPillCount(dose: number, count: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/setcount?dose=${dose}&count=${count}`);
      return response.ok;
    } catch (error) {
      console.error('Failed to set pill count:', error);
      return false;
    }
  }

  async getData(): Promise<PillData | null> {
    try {
      console.log('Attempting to connect to ESP at:', this.baseUrl);
      
      let response;
      if (isNative()) {
        // Use Capacitor HTTP for native apps (bypasses CORS)
        response = await CapacitorHttp.get({
          url: `${this.baseUrl}/getdata`,
          headers: {},
        });
        console.log('ESP response (native):', response.status);
        if (response.status === 200) {
          console.log('ESP data received:', response.data);
          return response.data;
        }
      } else {
        // Use regular fetch for web
        const fetchResponse = await fetch(`${this.baseUrl}/getdata`);
        console.log('ESP response status:', fetchResponse.status, fetchResponse.statusText);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log('ESP data received:', data);
          return data;
        }
      }
      
      console.error('ESP response not ok');
      return null;
    } catch (error) {
      console.error('Failed to get data from ESP:', error);
      console.error('ESP URL attempted:', this.baseUrl);
      
      // Check if it's a CORS/Mixed content issue
      if (!isNative() && error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('CORS/Mixed Content Error: HTTPS site cannot connect to HTTP ESP8266');
        console.error('Solutions: 1) Use native mobile app, 2) Run locally on HTTP, 3) Enable HTTPS on ESP8266');
      }
      
      return null;
    }
  }

  async getAlert(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/alert`);
      if (response.ok) {
        return await response.text();
      }
      return '';
    } catch (error) {
      console.error('Failed to get alert:', error);
      return '';
    }
  }

  setIPAddress(ip: string) {
    this.baseUrl = `http://${ip}`;
    localStorage.setItem('esp-ip', ip);
  }

  getIPAddress(): string {
    return localStorage.getItem('esp-ip') || '192.168.1.100';
  }
}