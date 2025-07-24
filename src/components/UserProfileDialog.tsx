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
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">Patient Details</DialogTitle>
          <p className="text-sm text-muted-foreground">Manage patient information and emergency contacts</p>
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
          
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              placeholder="Enter patient's age"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter patient's email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter patient's phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctor" className="text-sm font-medium">Primary Doctor</Label>
            <Input
              id="doctor"
              value={formData.doctorName}
              onChange={(e) => handleChange('doctorName', e.target.value)}
              placeholder="Enter primary doctor's name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergency" className="text-sm font-medium">Emergency Contact</Label>
            <Input
              id="emergency"
              value={formData.emergencyContact}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              placeholder="Name and phone of emergency contact"
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