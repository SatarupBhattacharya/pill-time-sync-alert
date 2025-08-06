export interface Medicine {
  id: string;
  name: string;
  count: number;
}

export interface PillData {
  medicines: {
    breakfast: Medicine[];
    lunch: Medicine[];
    dinner: Medicine[];
  };
  alarmBreakfast: number;
  alarmLunch: number;
  alarmDinner: number;
}

export interface DoctorAppointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  notes?: string;
}

export interface PillHistoryEntry {
  id: string;
  medicineName: string;
  dose: 'breakfast' | 'lunch' | 'dinner';
  action: 'added' | 'removed' | 'taken' | 'count_updated';
  timestamp: string;
  oldCount?: number;
  newCount?: number;
}

export interface UserProfile {
  name: string;
  age: number;
  email: string;
  phone: string;
  doctorName: string;
  emergencyContact: string;
  doctorAppointments: DoctorAppointment[];
  pillHistory: PillHistoryEntry[];
}

export interface DoseTime {
  hour: number;
  minute: number;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
}