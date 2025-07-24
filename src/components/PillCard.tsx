import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Medicine } from '@/types/pill-monitor';
import { MedicineCard } from '@/components/MedicineCard';
import { AddMedicineDialog } from '@/components/AddMedicineDialog';
import { cn } from '@/lib/utils';

interface PillCardProps {
  dose: 'breakfast' | 'lunch' | 'dinner';
  medicines: Medicine[];
  alarmTime: number;
  onTimeClick: () => void;
  onAddMedicine: (name: string) => void;
  onRemoveMedicine: (medicineId: string) => void;
  onUpdateMedicineCount: (medicineId: string, increment: boolean) => void;
}

const doseConfig = {
  breakfast: {
    title: 'Morning',
    icon: '🌅',
    gradient: 'from-orange-400 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
  },
  lunch: {
    title: 'Lunch', 
    icon: '☀️',
    gradient: 'from-yellow-400 to-yellow-600',
    bgGradient: 'from-yellow-50 to-yellow-100',
  },
  dinner: {
    title: 'Evening',
    icon: '🌙',
    gradient: 'from-purple-400 to-purple-600', 
    bgGradient: 'from-purple-50 to-purple-100',
  }
};

export const PillCard = ({ dose, medicines, alarmTime, onTimeClick, onAddMedicine, onRemoveMedicine, onUpdateMedicineCount }: PillCardProps) => {
  const config = doseConfig[dose];
  const hours = Math.floor(alarmTime / 100);
  const minutes = alarmTime % 100;
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  const totalPills = medicines.reduce((total, med) => total + med.count, 0);
  const hasLowStock = medicines.some(med => med.count < 3);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-medical hover:scale-105",
      "bg-gradient-card border-0 shadow-soft"
    )}>
      <div className={cn("absolute top-0 left-0 w-full h-2 bg-gradient-to-r", config.gradient)} />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            {config.title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTimeClick}
            className="text-muted-foreground hover:text-primary h-auto p-1"
          >
            <Clock className="h-4 w-4 mr-1" />
            {timeString}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={cn(
            "text-2xl font-bold mb-1",
            hasLowStock ? "text-destructive" : "text-primary"
          )}>
            {totalPills}
          </div>
          <div className="text-xs text-muted-foreground">
            Total Pills ({medicines.length} medicines)
          </div>
        </div>
        
        <div className="space-y-2">
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onIncrement={() => onUpdateMedicineCount(medicine.id, true)}
              onDecrement={() => onUpdateMedicineCount(medicine.id, false)}
              onRemove={() => onRemoveMedicine(medicine.id)}
              canRemove={medicines.length > 1}
            />
          ))}
        </div>
        
        <AddMedicineDialog onAdd={onAddMedicine} />
      </CardContent>
    </Card>
  );
};