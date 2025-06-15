'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Thermometer,
  Activity,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useState } from 'react';

interface VitalSign {
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
  icon: any;
}

interface Symptom {
  name: string;
  severity: number;
  date: string;
  notes?: string;
}

interface Appointment {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: 'checkup' | 'follow-up' | 'consultation';
}

interface HealthGoal {
  name: string;
  target: string;
  current: string;
  progress: number;
  deadline: string;
}

export function HealthStatusIndicators() {
  const [vitalSigns] = useState<VitalSign[]>([
    {
      name: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'normal',
      lastUpdated: '2 hours ago',
      icon: Heart
    },
    {
      name: 'Temperature',
      value: '36.8',
      unit: '°C',
      status: 'normal',
      lastUpdated: '4 hours ago',
      icon: Thermometer
    },
    {
      name: 'Oxygen Saturation',
      value: '98',
      unit: '%',
      status: 'normal',
      lastUpdated: '6 hours ago',
      icon: Activity
    }
  ]);

  const [recentSymptoms] = useState<Symptom[]>([
    {
      name: 'Mild Headache',
      severity: 3,
      date: 'Today',
      notes: 'After lunch, lasted 2 hours'
    },
    {
      name: 'Fatigue',
      severity: 2,
      date: 'Yesterday',
      notes: 'Afternoon tiredness'
    }
  ]);

  const [upcomingAppointments] = useState<Appointment[]>([
    {
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'checkup'
    },
    {
      doctor: 'Dr. Michael Chen',
      specialty: 'General Practice',
      date: 'Feb 15',
      time: '10:30 AM',
      type: 'follow-up'
    }
  ]);

  const [healthGoals] = useState<HealthGoal[]>([
    {
      name: 'Weight Loss',
      target: '65 kg',
      current: '68.5 kg',
      progress: 70,
      deadline: 'March 2024'
    },
    {
      name: 'Daily Steps',
      target: '10,000',
      current: '8,432',
      progress: 84,
      deadline: 'Daily'
    },
    {
      name: 'Blood Pressure',
      target: '<120/80',
      current: '120/80',
      progress: 100,
      deadline: 'Ongoing'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'secondary';
      case 'follow-up':
        return 'outline';
      case 'consultation':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <span>Health Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vital Signs */}
        <div className="space-y-3">
          <h4 className="font-semibold">Vital Signs</h4>
          <div className="space-y-3">
            {vitalSigns.map((vital, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                    <vital.icon className={`w-4 h-4 ${getStatusColor(vital.status)}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{vital.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {vital.lastUpdated}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">
                    {vital.value} {vital.unit}
                  </span>
                  {getStatusIcon(vital.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Symptoms */}
        <div className="space-y-3">
          <h4 className="font-semibold">Recent Symptoms</h4>
          {recentSymptoms.length > 0 ? (
            <div className="space-y-2">
              {recentSymptoms.map((symptom, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{symptom.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(symptom.severity)}`} />
                      <span className="text-xs text-muted-foreground">{symptom.severity}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{symptom.date}</p>
                  {symptom.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{symptom.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent symptoms recorded</p>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-3">
          <h4 className="font-semibold">Upcoming Appointments</h4>
          <div className="space-y-2">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{appointment.doctor}</p>
                  <Badge variant={getAppointmentTypeColor(appointment.type) as any} className="text-xs">
                    {appointment.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {appointment.date} at {appointment.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Goals */}
        <div className="space-y-3">
          <h4 className="font-semibold">Health Goals</h4>
          <div className="space-y-3">
            {healthGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{goal.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{goal.deadline}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {goal.current} / {goal.target}
                  </span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}