import { useState, useEffect } from 'react';
import { Settings, User, Bell, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillCard } from '@/components/PillCard';
import { TimePickerDialog } from '@/components/TimePickerDialog';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { SettingsDialog } from '@/components/SettingsDialog';
import { usePillMonitor } from '@/hooks/use-pill-monitor';
import { useToast } from '@/hooks/use-toast';
import pillMonitorIcon from '@/assets/pill-monitor-icon.png';

const Dashboard = () => {
  const {
    pillData,
    userProfile,
    setUserProfile,
    notificationSettings,
    setNotificationSettings,
    isConnected,
    lastSync,
    addMedicine,
    removeMedicine,
    updateMedicineCount,
    updateAllMedicinesForDose,
    updateAlarmTime,
    syncWithESP,
    checkForAlerts,
    requestNotificationPermission,
    espService,
  } = usePillMonitor();

  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedDose, setSelectedDose] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Auto-sync and check alerts every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await syncWithESP();
      await checkForAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [syncWithESP, checkForAlerts]);

  // Initial sync on mount
  useEffect(() => {
    syncWithESP();
    requestNotificationPermission();
  }, [syncWithESP, requestNotificationPermission]);

  const handleTimeClick = (dose: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedDose(dose);
    setTimeDialogOpen(true);
  };

  const handleTimeUpdate = async (hour: number, minute: number) => {
    await updateAlarmTime(selectedDose, hour, minute);
  };

  const handleSync = async () => {
    setIsLoading(true);
    const success = await syncWithESP();
    if (!success) {
      toast({
        title: "Sync Failed",
        description: "Could not connect to ESP8266. Check your connection.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const installPWA = () => {
    toast({
      title: "📱 Install App",
      description: "Use your browser's 'Add to Home Screen' option to install this app!",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={pillMonitorIcon} alt="Pill Monitor" className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Pill Monitor</h1>
            <p className="text-sm text-muted-foreground">Smart Medicine Tracker</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={installPWA}
            className="hidden sm:flex"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Install
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsDialogOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProfileDialogOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus
        isConnected={isConnected}
        lastSync={lastSync}
        onSync={handleSync}
        isLoading={isLoading}
      />

      {/* Welcome Card */}
      {userProfile.name && (
        <Card className="bg-gradient-medical text-white border-0 shadow-medical">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-semibold">Welcome back, {userProfile.name}!</h2>
                <p className="text-white/90">Stay on track with your medication schedule.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pill Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <PillCard
          dose="breakfast"
          medicines={pillData.medicines.breakfast}
          alarmTime={pillData.alarmBreakfast}
          onTimeClick={() => handleTimeClick('breakfast')}
          onAddMedicine={(name) => addMedicine('breakfast', name)}
          onRemoveMedicine={(id) => removeMedicine('breakfast', id)}
          onUpdateMedicineCount={(id, increment) => updateMedicineCount('breakfast', id, increment)}
        />
        
        <PillCard
          dose="lunch"
          medicines={pillData.medicines.lunch}
          alarmTime={pillData.alarmLunch}
          onTimeClick={() => handleTimeClick('lunch')}
          onAddMedicine={(name) => addMedicine('lunch', name)}
          onRemoveMedicine={(id) => removeMedicine('lunch', id)}
          onUpdateMedicineCount={(id, increment) => updateMedicineCount('lunch', id, increment)}
        />
        
        <PillCard
          dose="dinner"
          medicines={pillData.medicines.dinner}
          alarmTime={pillData.alarmDinner}
          onTimeClick={() => handleTimeClick('dinner')}
          onAddMedicine={(name) => addMedicine('dinner', name)}
          onRemoveMedicine={(id) => removeMedicine('dinner', id)}
          onUpdateMedicineCount={(id, increment) => updateMedicineCount('dinner', id, increment)}
        />
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {pillData.medicines.breakfast.reduce((sum, med) => sum + med.count, 0) + 
                 pillData.medicines.lunch.reduce((sum, med) => sum + med.count, 0) + 
                 pillData.medicines.dinner.reduce((sum, med) => sum + med.count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Pills</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-success">
                {pillData.medicines.breakfast.length + pillData.medicines.lunch.length + pillData.medicines.dinner.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Medicines</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-medical-blue">
                {[...pillData.medicines.breakfast, ...pillData.medicines.lunch, ...pillData.medicines.dinner]
                  .filter(med => med.count < 3).length}
              </div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-medical-orange">
                {isConnected ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">ESP Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TimePickerDialog
        open={timeDialogOpen}
        onOpenChange={setTimeDialogOpen}
        dose={selectedDose}
        currentTime={
          selectedDose === 'breakfast' ? pillData.alarmBreakfast :
          selectedDose === 'lunch' ? pillData.alarmLunch :
          pillData.alarmDinner
        }
        onSave={handleTimeUpdate}
      />

      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        profile={userProfile}
        onSave={setUserProfile}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        notificationSettings={notificationSettings}
        onNotificationSettingsChange={setNotificationSettings}
        espService={espService}
      />
    </div>
  );
};

export default Dashboard;