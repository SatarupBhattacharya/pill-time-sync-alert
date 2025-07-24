import { Plus, Minus, Trash2, Pill } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Medicine } from '@/types/pill-monitor';
import { cn } from '@/lib/utils';

interface MedicineCardProps {
  medicine: Medicine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const MedicineCard = ({ medicine, onIncrement, onDecrement, onRemove, canRemove }: MedicineCardProps) => {
  const isLowCount = medicine.count < 3;

  return (
    <Card className={cn(
      "relative border transition-all duration-200",
      isLowCount && "border-destructive bg-destructive/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill className={cn(
              "h-4 w-4",
              isLowCount ? "text-destructive" : "text-primary"
            )} />
            <span className="font-medium text-sm">{medicine.name}</span>
          </div>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className={cn(
              "text-lg font-bold",
              isLowCount ? "text-destructive" : "text-primary"
            )}>
              {medicine.count}
            </div>
            {isLowCount && (
              <div className="text-xs text-destructive">Low Stock</div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onDecrement}
              disabled={medicine.count <= 0}
              className="h-7 w-7 p-0 rounded-full"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onIncrement}
              className="h-7 w-7 p-0 rounded-full"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};