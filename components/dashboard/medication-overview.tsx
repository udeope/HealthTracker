'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pill, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useState } from 'react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  critical: boolean;
  refillDate?: string;
  pillsRemaining?: number;
}

const initialMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    time: '8:00 AM',
    taken: true,
    critical: true,
    refillDate: '2024-02-15',
    pillsRemaining: 15
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    time: '12:00 PM',
    taken: true,
    critical: true,
    refillDate: '2024-02-20',
    pillsRemaining: 25
  },
  {
    id: '3',
    name: 'Vitamin D',
    dosage: '1000 IU',
    time: '6:00 PM',
    taken: false,
    critical: false,
    refillDate: '2024-03-01',
    pillsRemaining: 45
  },
  {
    id: '4',
    name: 'Omega-3',
    dosage: '1000mg',
    time: '8:00 PM',
    taken: false,
    critical: false,
    refillDate: '2024-02-25',
    pillsRemaining: 30
  }
];

export function MedicationOverview() {
  const [medications, setMedications] = useState(initialMedications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleMedication = (id: string) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const takenCount = medications.filter(med => med.taken).length;
  const totalCount = medications.length;
  const adherenceRate = (takenCount / totalCount) * 100;

  const upcomingMedications = medications.filter(med => !med.taken);
  const criticalMedications = medications.filter(med => med.critical && !med.taken);
  const refillAlerts = medications.filter(med => med.pillsRemaining && med.pillsRemaining <= 7);

  const getTimeStatus = (time: string, taken: boolean) => {
    const now = new Date();
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    const medicationTime = new Date();
    medicationTime.setHours(period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours);
    medicationTime.setMinutes(minutes);
    
    if (taken) return 'taken';
    if (now > medicationTime) return 'overdue';
    if (now.getTime() - medicationTime.getTime() > -30 * 60 * 1000) return 'due'; // 30 min before
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return <Badge variant="secondary" className="text-xs">Taken</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      case 'due':
        return <Badge variant="outline" className="text-xs">Due Now</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Upcoming</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'due':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            <span>Medications</span>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <div className="text-center py-8 text-muted-foreground">
                Medication management form would go here
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adherence Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today's Adherence</span>
            <span className="text-sm font-bold">{takenCount}/{totalCount} taken</span>
          </div>
          <Progress value={adherenceRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {adherenceRate.toFixed(0)}% adherence rate
          </p>
        </div>

        {/* Alerts */}
        {(criticalMedications.length > 0 || refillAlerts.length > 0) && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Alerts</h4>
            {criticalMedications.length > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">
                  {criticalMedications.length} critical medication{criticalMedications.length > 1 ? 's' : ''} pending
                </span>
              </div>
            )}
            {refillAlerts.length > 0 && (
              <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  {refillAlerts.length} medication{refillAlerts.length > 1 ? 's' : ''} need refill soon
                </span>
              </div>
            )}
          </div>
        )}

        {/* Today's Schedule */}
        <div className="space-y-3">
          <h4 className="font-semibold">Today's Schedule</h4>
          <div className="space-y-3">
            {medications.map((medication) => {
              const status = getTimeStatus(medication.time, medication.taken);
              return (
                <div key={medication.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    checked={medication.taken}
                    onCheckedChange={() => toggleMedication(medication.id)}
                    className="flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm truncate">
                        {medication.name}
                      </p>
                      {medication.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {medication.dosage} at {medication.time}
                    </p>
                    {medication.pillsRemaining && medication.pillsRemaining <= 7 && (
                      <p className="text-xs text-orange-600">
                        {medication.pillsRemaining} pills remaining
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {getStatusIcon(status)}
                    {getStatusBadge(status)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{takenCount}</p>
            <p className="text-xs text-muted-foreground">Taken Today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">{upcomingMedications.length}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}