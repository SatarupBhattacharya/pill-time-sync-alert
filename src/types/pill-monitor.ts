export interface PillData {
  pillBreakfast: number;
  pillLunch: number;
  pillDinner: number;
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