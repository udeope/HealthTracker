'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Pill,
  Activity,
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const activities = [
  {
    type: 'medication',
    title: 'Took Lisinopril',
    description: '5mg - Blood pressure medication',
    time: '2 hours ago',
    status: 'completed',
    icon: Pill,
    color: 'text-blue-600'
  },
  {
    type: 'metric',
    title: 'Blood Pressure Logged',
    description: '120/80 mmHg - Normal reading',
    time: '4 hours ago',
    status: 'completed',
    icon: Activity,
    color: 'text-green-600'
  },
  {
    type: 'appointment',
    title: 'Appointment Reminder',
    description: 'Dr. Johnson - Cardiology checkup',
    time: 'Tomorrow 2:00 PM',
    status: 'upcoming',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    type: 'consultation',
    title: 'Consultation Request',
    description: 'Chat with Dr. Smith about symptoms',
    time: '1 day ago',
    status: 'pending',
    icon: MessageCircle,
    color: 'text-orange-600'
  },
  {
    type: 'medication',
    title: 'Missed Medication',
    description: 'Metformin 500mg - Diabetes medication',
    time: '2 days ago',
    status: 'missed',
    icon: Pill,
    color: 'text-red-600'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'upcoming':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-orange-600" />;
    case 'missed':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    completed: { label: 'Completed', variant: 'secondary' as const },
    upcoming: { label: 'Upcoming', variant: 'default' as const },
    pending: { label: 'Pending', variant: 'outline' as const },
    missed: { label: 'Missed', variant: 'destructive' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
};

export function RecentActivity() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <activity.icon className={`w-4 h-4 ${activity.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                {getStatusIcon(activity.status)}
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
                {getStatusBadge(activity.status)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}