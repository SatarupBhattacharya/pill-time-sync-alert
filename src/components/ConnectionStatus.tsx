import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastSync: Date | null;
  onSync: () => void;
  isLoading: boolean;
}

export const ConnectionStatus = ({ isConnected, lastSync, onSync, isLoading }: ConnectionStatusProps) => {
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  const isHttpsToHttpIssue = window.location.protocol === 'https:';

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-soft">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          isConnected ? "bg-success/10" : "bg-destructive/10"
        )}>
          {isConnected ? (
            <Wifi className="h-4 w-4 text-success" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">ESP8266</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Last sync: {formatLastSync(lastSync)}
          </div>
        </div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onSync}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        Sync
      </Button>
    </div>
  );
};