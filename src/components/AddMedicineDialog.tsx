import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddMedicineDialogProps {
  onAdd: (name: string) => void;
}

export const AddMedicineDialog = ({ onAdd }: AddMedicineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [medicineName, setMedicineName] = useState('');

  const handleAdd = () => {
    if (medicineName.trim()) {
      onAdd(medicineName.trim());
      setMedicineName('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="medicine-name">Medicine Name</Label>
            <Input
              id="medicine-name"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="Enter medicine name"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!medicineName.trim()}>
              Add Medicine
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};