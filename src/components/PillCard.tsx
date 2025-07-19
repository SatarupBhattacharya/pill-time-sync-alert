import { Plus, Minus, Clock, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PillCardProps {
  dose: 'breakfast' | 'lunch' | 'dinner';
  count: number;
  alarmTime: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onTimeClick: () => void;
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

export const PillCard = ({ dose, count, alarmTime, onIncrement, onDecrement, onTimeClick }: PillCardProps) => {
  const config = doseConfig[dose];
  const hours = Math.floor(alarmTime / 100);
  const minutes = alarmTime % 100;
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  const isLowCount = count < 3;

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
        <div className="flex items-center justify-center">
          <div className={cn(
            "rounded-full p-6 bg-gradient-to-br",
            config.bgGradient,
            isLowCount && "ring-2 ring-destructive ring-offset-2 animate-pulse-soft"
          )}>
            <Pill className={cn(
              "h-8 w-8",
              isLowCount ? "text-destructive" : "text-primary"
            )} />
          </div>
        </div>
        
        <div className="text-center">
          <div className={cn(
            "text-3xl font-bold mb-1",
            isLowCount ? "text-destructive" : "text-primary"
          )}>
            {count}
          </div>
          <div className="text-sm text-muted-foreground">
            {isLowCount ? "⚠️ Low Stock" : "Pills remaining"}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onDecrement}
            disabled={count <= 0}
            className="h-10 w-10 p-0 rounded-full"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onIncrement}
            className="h-10 w-10 p-0 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};