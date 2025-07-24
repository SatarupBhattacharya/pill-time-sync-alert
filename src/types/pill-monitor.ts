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

export interface UserProfile {
  name: string;
  age: number;
  email: string;
  phone: string;
  doctorName: string;
  emergencyContact: string;
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