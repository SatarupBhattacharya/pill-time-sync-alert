import { PillData } from '@/types/pill-monitor';
import { CapacitorHttp } from '@capacitor/core';

// Check if running in native app or if we should force HTTP mode
const isNative = () => {
  return typeof window !== 'undefined' && 
         (window as any).Capacitor && 
         (window as any).Capacitor.isNativePlatform();
};

const isHTTPForced = () => {
  return localStorage.getItem('force-http-mode') === 'true';
};

export class ESPService {
  private baseUrl: string;

constructor() {
  this.baseUrl = 'http://192.168.29.185'; // ✅ Hardcoded IP
  console.log('🚨 USING HARDCODED IP MODE:', this.baseUrl);
}


  async setAlarm(dose: number, hour: number, minute: number): Promise<boolean> {
    try {
      if (isNative() || isHTTPForced()) {
        const response = await CapacitorHttp.get({
          url: `${this.baseUrl}/setalarm?dose=${dose}&hh=${hour}&mm=${minute}`,
          headers: {},
        });
        return response.status === 200;
      } else {
        const response = await fetch(`${this.baseUrl}/setalarm?dose=${dose}&hh=${hour}&mm=${minute}`);
        return response.ok;
      }
    } catch (error) {
      console.error('Failed to set alarm:', error);
      return false;
    }
  }

  async setPillCount(dose: number, count: number): Promise<boolean> {
    try {
      if (isNative() || isHTTPForced()) {
        const response = await CapacitorHttp.get({
          url: `${this.baseUrl}/setcount?dose=${dose}&count=${count}`,
          headers: {},
        });
        return response.status === 200;
      } else {
        const response = await fetch(`${this.baseUrl}/setcount?dose=${dose}&count=${count}`);
        return response.ok;
      }
    } catch (error) {
      console.error('Failed to set pill count:', error);
      return false;
    }
  }

  async getData(): Promise<PillData | null> {
    try {
      console.log('🔌 Connecting to ESP at:', this.baseUrl);
      console.log('📱 Native app:', isNative());
      console.log('🌐 User agent:', navigator.userAgent);
      
      let response;
      if (isNative() || isHTTPForced()) {
        // Use Capacitor HTTP for native apps (bypasses CORS completely)
        console.log('✅ Using Capacitor HTTP (no CORS restrictions)');
        response = await CapacitorHttp.get({
          url: `${this.baseUrl}/getdata`,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        console.log('📡 ESP response (native):', response.status, response.data);
        if (response.status === 200) {
          return response.data;
        }
      } else {
        // Try regular fetch for web (will fail due to CORS on HTTPS sites)
        console.log('⚠️  Using regular fetch (may fail due to CORS)');
        const fetchResponse = await fetch(`${this.baseUrl}/getdata`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        console.log('📡 ESP response status:', fetchResponse.status);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log('📊 ESP data received:', data);
          return data;
        }
      }
      
      console.error('❌ ESP response not ok');
      return null;
    } catch (error) {
      console.error('💥 Failed to connect to ESP:', error);
      console.error('🔗 URL attempted:', this.baseUrl);
      
      // Provide clear guidance based on environment
      if (!isNative() && !isHTTPForced()) {
        console.error('🚫 CORS/Mixed Content Error: HTTPS website cannot connect to HTTP ESP8266');
        console.error('💡 SOLUTION: Download the mobile app for direct ESP connection!');
        console.error('📱 Mobile app bypasses browser security restrictions');
      }
      
      return null;
    }
  }

  async getAlert(): Promise<string> {
    try {
      if (isNative() || isHTTPForced()) {
        const response = await CapacitorHttp.get({
          url: `${this.baseUrl}/alert`,
          headers: {},
        });
        if (response.status === 200) {
          return response.data || '';
        }
      } else {
        const response = await fetch(`${this.baseUrl}/alert`);
        if (response.ok) {
          return await response.text();
        }
      }
      return '';
    } catch (error) {
      console.error('Failed to get alert:', error);
      return '';
    }
  }

  setIPAddress(ip: string) {
    // Always use HTTP for ESP connections
    this.baseUrl = `http://${ip}`;
    localStorage.setItem('esp-ip', ip);
    console.log('📍 ESP IP updated to:', this.baseUrl);
  }

  getIPAddress(): string {
    return localStorage.getItem('esp-ip') || '192.168.1.100';
  }

  // Enable HTTP mode for testing (bypasses some browser restrictions)
  enableHTTPMode() {
    localStorage.setItem('force-http-mode', 'true');
    console.log('🔓 HTTP mode enabled - app will attempt direct connections');
  }

  // Disable HTTP mode
  disableHTTPMode() {
    localStorage.setItem('force-http-mode', 'false');
    console.log('🔒 HTTP mode disabled');
  }
}
