'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Heart, Plus, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const symptoms = [
  {
    id: '1',
    name: 'Headache',
    severity: 6,
    date: '2024-01-07',
    time: '02:30 PM',
    duration: '2 hours',
    notes: 'Mild throbbing pain, started after lunch',
    triggers: ['Stress', 'Dehydration']
  },
  {
    id: '2',
    name: 'Fatigue',
    severity: 4,
    date: '2024-01-06',
    time: '03:00 PM',
    duration: '3 hours',
    notes: 'General tiredness, improved after rest',
    triggers: ['Poor sleep']
  },
  {
    id: '3',
    name: 'Nausea',
    severity: 3,
    date: '2024-01-05',
    time: '08:00 AM',
    duration: '30 minutes',
    notes: 'Mild nausea before breakfast',
    triggers: ['Empty stomach']
  },
  {
    id: '4',
    name: 'Joint Pain',
    severity: 5,
    date: '2024-01-04',
    time: '06:00 PM',
    duration: '4 hours',
    notes: 'Pain in right knee after exercise',
    triggers: ['Physical activity']
  }
];

export default function SymptomsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    severity: '',
    duration: '',
    notes: '',
    triggers: ''
  });

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityBadge = (severity: number) => {
    if (severity <= 3) return <Badge variant="secondary">Mild</Badge>;
    if (severity <= 6) return <Badge variant="outline">Moderate</Badge>;
    return <Badge variant="destructive">Severe</Badge>;
  };

  const handleAddSymptom = () => {
    // In a real app, this would save to the database
    console.log('Adding symptom:', newSymptom);
    setNewSymptom({ name: '', severity: '', duration: '', notes: '', triggers: '' });
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Symptoms Tracker</h1>
            <p className="text-muted-foreground">
              Monitor and track your symptoms to identify patterns
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Log Symptom</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log New Symptom</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symptom-name">Symptom Name</Label>
                  <Input
                    id="symptom-name"
                    placeholder="e.g., Headache, Fatigue"
                    value={newSymptom.name}
                    onChange={(e) => setNewSymptom(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity (1-10)</Label>
                  <Select value={newSymptom.severity} onValueChange={(value) => setNewSymptom(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2 hours, 30 minutes"
                    value={newSymptom.duration}
                    onChange={(e) => setNewSymptom(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details about the symptom"
                    value={newSymptom.notes}
                    onChange={(e) => setNewSymptom(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="triggers">Possible Triggers</Label>
                  <Input
                    id="triggers"
                    placeholder="e.g., Stress, Food, Weather"
                    value={newSymptom.triggers}
                    onChange={(e) => setNewSymptom(prev => ({ ...prev, triggers: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddSymptom} className="w-full">
                  Log Symptom
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Total Symptoms</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{symptoms.length}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Severe Symptoms</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{symptoms.filter(s => s.severity > 6).length}</p>
              <p className="text-xs text-muted-foreground">Severity > 6</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Most Common</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Headache</p>
              <p className="text-xs text-muted-foreground">2 occurrences</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Last Logged</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Today</p>
              <p className="text-xs text-muted-foreground">2:30 PM</p>
            </CardContent>
          </Card>
        </div>

        {/* Symptoms Table */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symptom</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Triggers</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symptoms.map((symptom) => (
                  <TableRow key={symptom.id}>
                    <TableCell className="font-medium">{symptom.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(symptom.severity)}`} />
                        <span>{symptom.severity}/10</span>
                        {getSeverityBadge(symptom.severity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(symptom.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{symptom.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>{symptom.duration}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {symptom.triggers.map((trigger, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{symptom.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}