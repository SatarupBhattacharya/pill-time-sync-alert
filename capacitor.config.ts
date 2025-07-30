import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f45517cad99441eb945a49aad199ae9e',
  appName: 'pill-time-sync-alert',
  webDir: 'dist',
  server: {
    url: 'https://f45517ca-d994-41eb-945a-49aad199ae9e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;