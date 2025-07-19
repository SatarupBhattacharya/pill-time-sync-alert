import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dose: 'breakfast' | 'lunch' | 'dinner';
  currentTime: number;
  onSave: (hour: number, minute: number) => void;
}

export const TimePickerDialog = ({ open, onOpenChange, dose, currentTime, onSave }: TimePickerDialogProps) => {
  const currentHour = Math.floor(currentTime / 100);
  const currentMinute = currentTime % 100;
  
  const [selectedHour, setSelectedHour] = useState(currentHour.toString());
  const [selectedMinute, setSelectedMinute] = useState(currentMinute.toString());

  const handleSave = () => {
    onSave(parseInt(selectedHour), parseInt(selectedMinute));
    onOpenChange(false);
  };

  const doseTitle = dose.charAt(0).toUpperCase() + dose.slice(1);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set {doseTitle} Time</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hour">Hour</Label>
            <Select value={selectedHour} onValueChange={setSelectedHour}>
              <SelectTrigger>
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minute">Minute</Label>
            <Select value={selectedMinute} onValueChange={setSelectedMinute}>
              <SelectTrigger>
                <SelectValue placeholder="Minute" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};