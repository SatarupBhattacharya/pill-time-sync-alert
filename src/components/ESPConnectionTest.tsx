import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ESPService } from '@/services/esp-service';

export const ESPConnectionTest = () => {
  const [espIP, setEspIP] = useState('192.168.1.100');
  const [status, setStatus] = useState('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setStatus('Testing...');
    
    const espService = new ESPService();
    espService.setIPAddress(espIP);
    
    try {
      const data = await espService.getData();
      if (data) {
        setStatus('✅ Connected! Data received: ' + JSON.stringify(data));
      } else {
        setStatus('❌ Connection failed - no data received');
      }
    } catch (error) {
      setStatus('❌ Connection error: ' + error);
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">ESP Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ESP IP Address:</label>
          <Input
            value={espIP}
            onChange={(e) => setEspIP(e.target.value)}
            placeholder="192.168.1.100"
          />
        </div>
        
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
        
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">Status:</p>
          <p className="text-sm">{status}</p>
        </div>
      </div>
    </Card>
  );
};