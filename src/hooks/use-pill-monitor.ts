import { useState, useEffect, useCallback } from 'react';
import { PillData, UserProfile, NotificationSettings, Medicine, PillHistoryEntry } from '@/types/pill-monitor';
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
    doctorAppointments: [],
    pillHistory: [],
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
      const profile = JSON.parse(savedUserProfile);
      // Ensure new properties exist for backward compatibility
      setUserProfile({
        ...profile,
        doctorAppointments: profile.doctorAppointments || [],
        pillHistory: profile.pillHistory || [],
      });
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

  const addHistoryEntry = useCallback((entry: Omit<PillHistoryEntry, 'id' | 'timestamp'>) => {
    const historyEntry: PillHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setUserProfile(prev => ({
      ...prev,
      pillHistory: [...prev.pillHistory, historyEntry],
    }));
  }, []);

  const addMedicine = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', name: string) => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name,
      count: 6,
    };
    
    setPillData(prev => ({
      ...prev,
      medicines: {
        ...prev.medicines,
        [dose]: [...prev.medicines[dose], newMedicine],
      },
    }));

    addHistoryEntry({
      medicineName: name,
      dose,
      action: 'added',
    });
  }, [addHistoryEntry]);

  const removeMedicine = useCallback((dose: 'breakfast' | 'lunch' | 'dinner', medicineId: string) => {
    let removedMedicine: Medicine | undefined;
    
    setPillData(prev => {
      removedMedicine = prev.medicines[dose].find(med => med.id === medicineId);
      return {
        ...prev,
        medicines: {
          ...prev.medicines,
          [dose]: prev.medicines[dose].filter(med => med.id !== medicineId),
        },
      };
    });

    if (removedMedicine) {
      addHistoryEntry({
        medicineName: removedMedicine.name,
        dose,
        action: 'removed',
      });
    }
  }, [addHistoryEntry]);

  const updateMedicineCount = useCallback(async (dose: 'breakfast' | 'lunch' | 'dinner', medicineId: string, increment: boolean) => {
    let updatedMedicine: { name: string; oldCount: number; newCount: number } | undefined;
    
    setPillData(prev => {
      const updatedMedicines = prev.medicines[dose].map(med => {
        if (med.id === medicineId) {
          const oldCount = med.count;
          const newCount = Math.max(0, increment ? med.count + 1 : med.count - 1);
          
          updatedMedicine = { name: med.name, oldCount, newCount };
          
          if (newCount < 3 && med.count >= 3) {
            toast({
              title: "⚠️ Low Pill Count",
              description: `${med.name} is running low! Please refill.`,
              variant: "destructive"
            });
          }
          
          return { ...med, count: newCount };
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

    if (updatedMedicine) {
      addHistoryEntry({
        medicineName: updatedMedicine.name,
        dose,
        action: 'count_updated',
        oldCount: updatedMedicine.oldCount,
        newCount: updatedMedicine.newCount,
      });
    }
  }, [toast, addHistoryEntry]);

  const updateAllMedicinesForDose = useCallback(async (dose: 'breakfast' | 'lunch' | 'dinner') => {
    // This function is called when sensor is touched - decreases all medicines for the dose by 1
    let takenMedicines: string[] = [];
    
    setPillData(prev => {
      const updatedMedicines = prev.medicines[dose].map(med => {
        const newCount = Math.max(0, med.count - 1);
        takenMedicines.push(med.name);
        
        if (newCount < 3) {
          toast({
            title: "⚠️ Low Pill Count",
            description: `${med.name} is running low! Please refill.`,
            variant: "destructive"
          });
        }
        
        return { ...med, count: newCount };
      });

      return {
        ...prev,
        medicines: {
          ...prev.medicines,
          [dose]: updatedMedicines,
        },
      };
    });

    // Add history entries for all taken medicines
    takenMedicines.forEach(medicineName => {
      addHistoryEntry({
        medicineName,
        dose,
        action: 'taken',
      });
    });
  }, [toast, addHistoryEntry]);

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
        const doseMatch = alert.match(/(morning|lunch|dinner)/i);
        if (doseMatch) {
          const alertDose = doseMatch[1].toLowerCase();
          const mappedDose = alertDose === 'morning' ? 'breakfast' : alertDose as 'lunch' | 'dinner';
          await updateAllMedicinesForDose(mappedDose);
        }
        
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
  }, [espService, notificationSettings.enabled, toast, updateAllMedicinesForDose]);

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
