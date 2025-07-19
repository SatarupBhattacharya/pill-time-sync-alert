import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { NotificationSettings } from '@/types/pill-monitor';
import { ESPService } from '@/services/esp-service';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
  espService: ESPService;
}

export const SettingsDialog = ({ 
  open, 
  onOpenChange, 
  notificationSettings, 
  onNotificationSettingsChange,
  espService 
}: SettingsDialogProps) => {
  const [espIP, setEspIP] = useState(espService.getIPAddress());
  const [tempNotificationSettings, setTempNotificationSettings] = useState(notificationSettings);

  const handleSave = () => {
    espService.setIPAddress(espIP);
    onNotificationSettingsChange(tempNotificationSettings);
    onOpenChange(false);
  };

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setTempNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* ESP8266 Settings */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">ESP8266 Connection</Label>
            <div className="space-y-2">
              <Label htmlFor="esp-ip">ESP8266 IP Address</Label>
              <Input
                id="esp-ip"
                value={espIP}
                onChange={(e) => setEspIP(e.target.value)}
                placeholder="192.168.1.100"
              />
              <p className="text-sm text-muted-foreground">
                Enter the IP address of your ESP8266 device
              </p>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Notifications</Label>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive medicine reminders
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={tempNotificationSettings.enabled}
                onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-enabled">Sound</Label>
                <p className="text-sm text-muted-foreground">
                  Play notification sound
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={tempNotificationSettings.sound}
                onCheckedChange={(checked) => handleNotificationChange('sound', checked)}
                disabled={!tempNotificationSettings.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vibration-enabled">Vibration</Label>
                <p className="text-sm text-muted-foreground">
                  Vibrate on mobile devices
                </p>
              </div>
              <Switch
                id="vibration-enabled"
                checked={tempNotificationSettings.vibration}
                onCheckedChange={(checked) => handleNotificationChange('vibration', checked)}
                disabled={!tempNotificationSettings.enabled}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};