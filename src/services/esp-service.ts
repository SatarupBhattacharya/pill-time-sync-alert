import { PillData } from '@/types/pill-monitor';

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
      const response = await fetch(`${this.baseUrl}/getdata`);
      console.log('ESP response status:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('ESP data received:', data);
        return data;
      }
      console.error('ESP response not ok:', response.status, response.statusText);
      return null;
    } catch (error) {
      console.error('Failed to get data from ESP:', error);
      console.error('ESP URL attempted:', this.baseUrl);
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