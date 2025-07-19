import { useState, useEffect, useCallback } from 'react';
import { PillData, UserProfile, NotificationSettings } from '@/types/pill-monitor';
import { ESPService } from '@/services/esp-service';
import { useToast } from '@/hooks/use-toast';

export const usePillMonitor = () => {
  const [pillData, setPillData] = useState<PillData>({
    pillBreakfast: 6,
    pillLunch: 6,
    pillDinner: 6,
    alarmBreakfast: 800,
    alarmLunch: 1300,
    alarmDinner: 2000,
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    age: 0,
    email: '',
    phone: '',
    doctorName: '',
    emergencyContact: '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
  });

  const [espService] = useState(() => new ESPService());
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPillData = localStorage.getItem('pill-data');
    const savedUserProfile = localStorage.getItem('user-profile');
    const savedNotificationSettings = localStorage.getItem('notification-settings');
    
    if (savedPillData) {
      setPillData(JSON.parse(savedPillData));
    }
    if (savedUserProfile) {
      setUserProfile(JSON.parse(savedUserProfile));
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }
  }, []);

  // Save data to localStorage when changed
  useEffect(() => {
    localStorage.setItem('pill-data', JSON.stringify(pillData));
  }, [pillData]);

  useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const syncWithESP = useCallback(async () => {
    try {
      const data = await espService.getData();
      if (data) {
        setPillData(data);
        setIsConnected(true);
        setLastSync(new Date());
        return true;
      }
      setIsConnected(false);
      return false;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, [espService]);

  const updatePillCount = useCallback(async (dose: 'breakfast' | 'lunch' | 'dinner', increment: boolean) => {
    const doseMap = { breakfast: 1, lunch: 2, dinner: 3 };
    const pillKey = `pill${dose.charAt(0).toUpperCase() + dose.slice(1)}` as keyof PillData;
    const currentCount = pillData[pillKey] as number;
    const newCount = Math.max(0, increment ? currentCount + 1 : currentCount - 1);
    
    const success = await espService.setPillCount(doseMap[dose], newCount);
    if (success || !isConnected) {
      setPillData(prev => ({ ...prev, [pillKey]: newCount }));
      
      if (newCount < 3) {
        toast({
          title: "⚠️ Low Pill Count",
          description: `${dose.charAt(0).toUpperCase() + dose.slice(1)} pills running low! Please refill.`,
          variant: "destructive"
        });
      }
    }
  }, [pillData, espService, isConnected, toast]);

  const updateAlarmTime = useCallback(async (dose: 'breakfast' | 'lunch' | 'dinner', hour: number, minute: number) => {
    const doseMap = { breakfast: 1, lunch: 2, dinner: 3 };
    const alarmKey = `alarm${dose.charAt(0).toUpperCase() + dose.slice(1)}` as keyof PillData;
    const alarmTime = hour * 100 + minute;
    
    const success = await espService.setAlarm(doseMap[dose], hour, minute);
    if (success || !isConnected) {
      setPillData(prev => ({ ...prev, [alarmKey]: alarmTime }));
      toast({
        title: "⏰ Alarm Updated",
        description: `${dose.charAt(0).toUpperCase() + dose.slice(1)} alarm set to ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      });
    }
  }, [espService, isConnected, toast]);

  const checkForAlerts = useCallback(async () => {
    const alert = await espService.getAlert();
    if (alert && notificationSettings.enabled) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pill Monitor', {
          body: alert,
          icon: '/src/assets/pill-monitor-icon.png',
        });
      }
      
      toast({
        title: "💊 Medicine Alert",
        description: alert,
      });
    }
  }, [espService, notificationSettings.enabled, toast]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    pillData,
    userProfile,
    setUserProfile,
    notificationSettings,
    setNotificationSettings,
    isConnected,
    lastSync,
    updatePillCount,
    updateAlarmTime,
    syncWithESP,
    checkForAlerts,
    requestNotificationPermission,
    espService,
  };
};