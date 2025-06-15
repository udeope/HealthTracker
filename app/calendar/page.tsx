'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Pill,
  Activity,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  title: string;
  type: 'appointment' | 'medication' | 'exercise' | 'checkup';
  date: Date;
  time: string;
  duration: string;
  location?: string;
  doctor?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const sampleAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Cardiology Checkup',
    type: 'appointment',
    date: new Date(2024, 0, 15),
    time: '2:00 PM',
    duration: '45 min',
    location: 'Heart Center, Room 302',
    doctor: 'Dr. Sarah Johnson',
    notes: 'Regular heart health checkup',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Blood Pressure Medication',
    type: 'medication',
    date: new Date(2024, 0, 15),
    time: '8:00 AM',
    duration: '5 min',
    notes: 'Take Lisinopril 10mg',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Morning Walk',
    type: 'exercise',
    date: new Date(2024, 0, 16),
    time: '7:00 AM',
    duration: '30 min',
    notes: 'Daily exercise routine',
    status: 'scheduled'
  },
  {
    id: '4',
    title: 'General Practice Visit',
    type: 'checkup',
    date: new Date(2024, 0, 20),
    time: '10:30 AM',
    duration: '30 min',
    location: 'Main Clinic, Room 105',
    doctor: 'Dr. Michael Chen',
    status: 'scheduled'
  }
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4" />;
      case 'exercise':
        return <Activity className="w-4 h-4" />;
      case 'checkup':
      case 'appointment':
        return <Heart className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exercise':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'checkup':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'appointment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Calendar</h1>
            <p className="text-muted-foreground">
              Manage your appointments, medications, and health activities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Event</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Event title" />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment">Medical Appointment</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="checkup">Health Checkup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input id="duration" placeholder="30 min" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Location (optional)" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional notes" />
                  </div>
                  <Button className="w-full">Add Event</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-3 rounded-lg border ${getAppointmentColor(appointment.type)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getAppointmentIcon(appointment.type)}
                            <span className="font-medium text-sm">{appointment.title}</span>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>{appointment.time} ({appointment.duration})</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                          {appointment.doctor && (
                            <div className="flex items-center space-x-2">
                              <User className="w-3 h-3" />
                              <span>{appointment.doctor}</span>
                            </div>
                          )}
                          {appointment.notes && (
                            <p className="text-muted-foreground mt-2">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No events scheduled for this date
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Appointments</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Medications</span>
                    <span className="font-medium">14</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Exercise Sessions</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments
                .filter(apt => apt.date >= new Date() && apt.status === 'scheduled')
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${getAppointmentColor(appointment.type)} flex items-center justify-center`}>
                        {getAppointmentIcon(appointment.type)}
                      </div>
                      <div>
                        <p className="font-medium">{appointment.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{format(appointment.date, 'MMM d')}</span>
                          <span>{appointment.time}</span>
                          {appointment.doctor && <span>{appointment.doctor}</span>}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}