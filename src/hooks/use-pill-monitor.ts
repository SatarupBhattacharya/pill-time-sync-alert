import { useState, useEffect, useCallback } from 'react';
import { PillData, UserProfile, NotificationSettings, Medicine } from '@/types/pill-monitor';
import { ESPService } from '@/services/esp-service';
import { useToast } from '@/hooks/use-toast';

export const usePillMonitor = () => {
  const [pillData, setPillData] = useState<PillData>({
    medicines: {
      breakfast: [{ id: '1', name: 'Morning Medicine', count: 6 }],
      lunch: [{ id: '2', name: 'Lunch Medicine', count: 6 }],
      dinner: [{ id: '3', name: 'Evening Medicine', count: 6 }],
    },
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
    appointments: [],
    pillHistory: []
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
      console.log('Starting ESP sync...');
      const data = await espService.getData();
      if (data) {
        console.log('ESP sync successful, data received');
        setPillData(data);
        setIsConnected(true);
        setLastSync(new Date());
        return true;
      }
      console.log('ESP sync failed - no data received');
      setIsConnected(false);
      return false;
    } catch (error) {
      console.error('ESP sync error:', error);
      setIsConnected(false);
      return false;
    }
  }, [espService]);

  const addPillHistory = useCallback((medicineName: string, count: number, dose: 'breakfast' | 'lunch' | 'dinner', action: 'taken' | 'added' | 'removed') => {
    const historyEntry = {
      id: Date.now().toString(),
      medicineName,
      count,
      dose,
      timestamp: new Date().toISOString(),
      action
    };

    setUserProfile(prev => ({
      ...prev,
      pillHistory: [...prev.pillHistory, historyEntry]
    }));
  }, []);

  const addMedicine = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString()
    };
    
    setPillData(prev => ({
      ...prev,
      medicines: {
        ...prev.medicines,
        [dose]: [...prev.medicines[dose], newMedicine],
      },
    }));

    addPillHistory(medicine.name, medicine.count, dose, 'added');
  }, [addPillHistory]);

  const removeMedicine = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', medicineId: string) => {
    const medicine = pillData.medicines[dose].find(m => m.id === medicineId);
    if (medicine) {
      addPillHistory(medicine.name, medicine.count, dose, 'removed');
    }

    setPillData(prev => ({
      ...prev,
      medicines: {
        ...prev.medicines,
        [dose]: prev.medicines[dose].filter(med => med.id !== medicineId),
      },
    }));
  }, [pillData.medicines, addPillHistory]);

  const updateMedicineCount = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', medicineId: string, newCount: number, action: 'increment' | 'decrement' | 'taken') => {
    const medicine = pillData.medicines[dose].find(m => m.id === medicineId);
    if (medicine && action === 'taken') {
      addPillHistory(medicine.name, 1, dose, 'taken');
    }

    setPillData(prev => {
      const updatedMedicines = prev.medicines[dose].map(med => {
        if (med.id === medicineId) {
          const updatedMedicine = { ...med, count: newCount };
          
          if (newCount < 3 && med.count >= 3) {
            toast({
              title: "⚠️ Low Pill Count",
              description: `${med.name} is running low! Please refill.`,
              variant: "destructive"
            });
          }
          
          return updatedMedicine;
        }
        return med;
      });

      return {
        ...prev,
        medicines: {
          ...prev.medicines,
          [dose]: updatedMedicines,
        },
      };
    });
  }, [pillData.medicines, addPillHistory, toast]);

  const updateAllMedicinesForDose = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', medicines: Medicine[]) => {
    setPillData(prev => ({
      ...prev,
      medicines: {
        ...prev.medicines,
        [dose]: medicines
      }
    }));
  }, []);

  const updateAlarmTime = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', timeInMinutes: number) => {
    const alarmKey = `alarm${dose.charAt(0).toUpperCase() + dose.slice(1)}` as keyof PillData;
    
    setPillData(prev => ({ ...prev, [alarmKey]: timeInMinutes }));
    
    const hour = Math.floor(timeInMinutes / 60);
    const minute = timeInMinutes % 60;
    
    toast({
      title: "⏰ Alarm Updated",
      description: `${dose.charAt(0).toUpperCase() + dose.slice(1)} alarm set to ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    });
  }, [toast]);

  const checkForAlerts = useCallback(async () => {
    const alert = await espService.getAlert();
    if (alert && notificationSettings.enabled) {
      if (alert.includes('take') && alert.includes('medicine')) {
        // Medicine time alert
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('TIME TO TAKE MEDICINE', {
            body: alert,
            icon: '/src/assets/pill-monitor-icon.png',
          });
        }
        
        toast({
          title: "⏰ Medicine Time",
          description: alert,
        });
      } else if (alert.includes('taken')) {
        // Medicine was taken - update pill counts
        // Medicine was taken alert handling can be added here if needed
        
        toast({
          title: "✅ Medicine Taken",
          description: alert,
        });
      } else if (alert.includes('missed')) {
        // Missed medicine alert
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('MISSED MEDICINE', {
            body: alert,
            icon: '/src/assets/pill-monitor-icon.png',
          });
        }
        
        toast({
          title: "⚠️ Missed Medicine",
          description: alert,
          variant: "destructive"
        });
      }
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
    addMedicine,
    removeMedicine,
    updateMedicineCount,
    updateAllMedicinesForDose,
    updateAlarmTime,
    syncWithESP,
    checkForAlerts,
    requestNotificationPermission,
    espService,
  };
};
