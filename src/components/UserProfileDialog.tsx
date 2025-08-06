import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/types/pill-monitor';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileDialog = ({ open, onOpenChange, profile, onSave }: UserProfileDialogProps) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">Patient Details</DialogTitle>
          <p className="text-sm text-muted-foreground">Enter patient name</p>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Patient Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter patient's full name"
              className="border-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};