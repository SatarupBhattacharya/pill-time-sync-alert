import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Download, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock,
  Pill,
  Activity,
  Heart,
  FileText,
  Calendar
} from 'lucide-react';
import { PillCard } from '@/components/PillCard';
import { TimePickerDialog } from '@/components/TimePickerDialog';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { MyProfile } from '@/components/MyProfile';
import { DataHistory } from '@/components/DataHistory';
import { usePillMonitor } from '@/hooks/use-pill-monitor';
import { toast } from 'sonner';
import pillMonitorIcon from '@/assets/pill-monitor-icon.png';

const Dashboard = () => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDose, setSelectedDose] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    pillData,
    userProfile,
    notificationSettings,
    isConnected,
    lastSync,
    setUserProfile,
    setNotificationSettings,
    addMedicine,
    removeMedicine,
    updateMedicineCount,
    updateAllMedicinesForDose,
    updateAlarmTime,
    syncWithESP,
    checkForAlerts,
    requestNotificationPermission,
    espService
  } = usePillMonitor();

  // Auto-sync every 30 seconds when connected
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        syncWithESP();
        checkForAlerts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, syncWithESP, checkForAlerts]);

  // Initial sync and permission request
  useEffect(() => {
    syncWithESP();
    requestNotificationPermission();
  }, [syncWithESP, requestNotificationPermission]);

  const handleTimeClick = (dose: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedDose(dose);
    setShowTimePicker(true);
  };

  const handleTimeUpdate = (hour: number, minute: number) => {
    const timeInMinutes = hour * 60 + minute;
    updateAlarmTime(selectedDose, timeInMinutes);
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncWithESP();
      toast.success('Synced with ESP device!');
    } catch (error) {
      toast.error('Failed to sync with device');
    } finally {
      setIsLoading(false);
    }
  };

  const installPWA = () => {
    toast.info('To install: tap the share button and select "Add to Home Screen"');
  };

  const getTotalPills = () => {
    return Object.values(pillData.medicines).flat().reduce((total, medicine) => total + medicine.count, 0);
  };

  const getTotalMedicines = () => {
    return Object.values(pillData.medicines).flat().length;
  };

  const getLowStockCount = () => {
    return Object.values(pillData.medicines).flat().filter(medicine => medicine.count <= 2).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <img src={pillMonitorIcon} alt="Pill Monitor" className="w-12 h-12 rounded-lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pill Monitor</h1>
              {userProfile.name && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome back, {userProfile.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowSettings(true)} variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowProfile(true)} variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button onClick={installPWA} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Install
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

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Data History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Message or Setup Prompt */}
            {!userProfile.name ? (
              <Card className="border-dashed border-2 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Heart className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Welcome to Pill Monitor!</h3>
                      <p className="text-sm text-muted-foreground">
                        Let's get started by setting up your profile
                      </p>
                    </div>
                    <Button onClick={() => setShowProfile(true)}>
                      <User className="h-4 w-4 mr-2" />
                      Set Up Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Hello, {userProfile.name}!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your health companion is ready to help you stay on track
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medicine Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <PillCard
                dose="breakfast"
                medicines={pillData.medicines.breakfast}
                alarmTime={pillData.alarmBreakfast}
                onTimeClick={() => handleTimeClick('breakfast')}
                onAddMedicine={(name) => addMedicine('breakfast', { name, count: 6 })}
                onRemoveMedicine={(id) => removeMedicine('breakfast', id)}
                onUpdateMedicineCount={(id, increment) => {
                  const medicine = pillData.medicines.breakfast.find(m => m.id === id);
                  if (medicine) {
                    const newCount = increment ? medicine.count + 1 : Math.max(0, medicine.count - 1);
                    const action = increment ? 'increment' : (!increment && medicine.count > 0) ? 'taken' : 'decrement';
                    updateMedicineCount('breakfast', id, newCount, action);
                  }
                }}
              />
              <PillCard
                dose="lunch"
                medicines={pillData.medicines.lunch}
                alarmTime={pillData.alarmLunch}
                onTimeClick={() => handleTimeClick('lunch')}
                onAddMedicine={(name) => addMedicine('lunch', { name, count: 6 })}
                onRemoveMedicine={(id) => removeMedicine('lunch', id)}
                onUpdateMedicineCount={(id, increment) => {
                  const medicine = pillData.medicines.lunch.find(m => m.id === id);
                  if (medicine) {
                    const newCount = increment ? medicine.count + 1 : Math.max(0, medicine.count - 1);
                    const action = increment ? 'increment' : (!increment && medicine.count > 0) ? 'taken' : 'decrement';
                    updateMedicineCount('lunch', id, newCount, action);
                  }
                }}
              />
              <PillCard
                dose="dinner"
                medicines={pillData.medicines.dinner}
                alarmTime={pillData.alarmDinner}
                onTimeClick={() => handleTimeClick('dinner')}
                onAddMedicine={(name) => addMedicine('dinner', { name, count: 6 })}
                onRemoveMedicine={(id) => removeMedicine('dinner', id)}
                onUpdateMedicineCount={(id, increment) => {
                  const medicine = pillData.medicines.dinner.find(m => m.id === id);
                  if (medicine) {
                    const newCount = increment ? medicine.count + 1 : Math.max(0, medicine.count - 1);
                    const action = increment ? 'increment' : (!increment && medicine.count > 0) ? 'taken' : 'decrement';
                    updateMedicineCount('dinner', id, newCount, action);
                  }
                }}
              />
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{getTotalPills()}</div>
                    <div className="text-sm text-muted-foreground">Total Pills</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">{getTotalMedicines()}</div>
                    <div className="text-sm text-muted-foreground">Medicines</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-red-600">{getLowStockCount()}</div>
                    <div className="text-sm text-muted-foreground">Low Stock</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center">
                      {isConnected ? (
                        <Wifi className="h-6 w-6 text-green-600" />
                      ) : (
                        <WifiOff className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">ESP Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <MyProfile 
              profile={userProfile} 
              onUpdateProfile={setUserProfile}
            />
          </TabsContent>

          <TabsContent value="history">
            <DataHistory pillHistory={userProfile.pillHistory} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <TimePickerDialog
          open={showTimePicker}
          onOpenChange={setShowTimePicker}
          dose={selectedDose}
          currentTime={
            selectedDose === 'breakfast' ? pillData.alarmBreakfast :
            selectedDose === 'lunch' ? pillData.alarmLunch :
            pillData.alarmDinner
          }
          onSave={handleTimeUpdate}
        />

        <UserProfileDialog
          open={showProfile}
          onOpenChange={setShowProfile}
          profile={userProfile}
          onSave={setUserProfile}
        />

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </div>
    </div>
  );
};

export default Dashboard;