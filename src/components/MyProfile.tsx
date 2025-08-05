import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Edit2, Plus, Save, Trash2, X, User, Phone } from 'lucide-react';
import { UserProfile, DoctorAppointment } from '@/types/pill-monitor';
import { toast } from 'sonner';

interface MyProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const MyProfile = ({ profile, onUpdateProfile }: MyProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorName: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleAddAppointment = () => {
    if (!newAppointment.doctorName || !newAppointment.date || !newAppointment.time) {
      toast.error('Please fill all required fields');
      return;
    }

    const appointment: DoctorAppointment = {
      id: Date.now().toString(),
      doctorName: newAppointment.doctorName,
      date: newAppointment.date,
      time: newAppointment.time,
      notes: newAppointment.notes
    };

    setEditedProfile(prev => ({
      ...prev,
      appointments: [...prev.appointments, appointment]
    }));

    setNewAppointment({ doctorName: '', date: '', time: '', notes: '' });
    setShowAddAppointment(false);
    toast.success('Appointment added');
  };

  const handleRemoveAppointment = (appointmentId: string) => {
    setEditedProfile(prev => ({
      ...prev,
      appointments: prev.appointments.filter(apt => apt.id !== appointmentId)
    }));
    toast.success('Appointment removed');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {profile.name || 'Not set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {profile.phone || 'Not set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {profile.email || 'Not set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              {isEditing ? (
                <Input
                  id="age"
                  type="number"
                  value={editedProfile.age || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter your age"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {profile.age || 'Not set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Primary Doctor</Label>
              {isEditing ? (
                <Input
                  id="doctor"
                  value={editedProfile.doctorName}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, doctorName: e.target.value }))}
                  placeholder="Enter primary doctor's name"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {profile.doctorName || 'Not set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              {isEditing ? (
                <Input
                  id="emergency"
                  value={editedProfile.emergencyContact}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Emergency contact name and phone"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {profile.emergencyContact || 'Not set'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Doctor Appointments
          </CardTitle>
          {isEditing && (
            <Button onClick={() => setShowAddAppointment(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddAppointment && (
            <Card className="mb-4 border-dashed">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Doctor Name *</Label>
                    <Input
                      id="doctorName"
                      value={newAppointment.doctorName}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder="Enter doctor's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddAppointment} size="sm">
                    Add Appointment
                  </Button>
                  <Button onClick={() => setShowAddAppointment(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {editedProfile.appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled</p>
              {isEditing && <p className="text-sm">Click "Add Appointment" to schedule one</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {editedProfile.appointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-medium">
                            {appointment.doctorName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          onClick={() => handleRemoveAppointment(appointment.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};