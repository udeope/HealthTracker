'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Pill,
  Activity,
  Calendar,
  FileText,
  MessageCircle
} from 'lucide-react';

const quickActions = [
  {
    title: 'Log Medication',
    description: 'Record medication intake',
    icon: Pill,
    action: () => console.log('Log medication'),
    color: 'bg-blue-500'
  },
  {
    title: 'Add Metric',
    description: 'Record health measurement',
    icon: Activity,
    action: () => console.log('Add metric'),
    color: 'bg-green-500'
  },
  {
    title: 'Schedule Appointment',
    description: 'Book healthcare visit',
    icon: Calendar,
    action: () => console.log('Schedule appointment'),
    color: 'bg-purple-500'
  },
  {
    title: 'Generate Report',
    description: 'Create health summary',
    icon: FileText,
    action: () => console.log('Generate report'),
    color: 'bg-orange-500'
  },
  {
    title: 'Start Consultation',
    description: 'Chat with healthcare provider',
    icon: MessageCircle,
    action: () => console.log('Start consultation'),
    color: 'bg-pink-500'
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-muted/50 transition-colors"
              onClick={action.action}
            >
              <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}