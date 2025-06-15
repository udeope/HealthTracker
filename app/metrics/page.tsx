'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { WeightTracker } from '@/components/dashboard/weight-tracker';
import { BloodPressureMonitor } from '@/components/dashboard/blood-pressure-monitor';
import { ActivityTracker } from '@/components/dashboard/activity-tracker';
import { DataVisualization } from '@/components/dashboard/data-visualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Plus, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';

const recentMetrics = [
  {
    id: '1',
    type: 'Weight',
    value: '68.5 kg',
    date: '2024-01-07',
    time: '08:30 AM',
    status: 'normal'
  },
  {
    id: '2',
    type: 'Blood Pressure',
    value: '120/80 mmHg',
    date: '2024-01-07',
    time: '09:15 AM',
    status: 'normal'
  },
  {
    id: '3',
    type: 'Heart Rate',
    value: '72 bpm',
    date: '2024-01-07',
    time: '09:16 AM',
    status: 'normal'
  },
  {
    id: '4',
    type: 'Temperature',
    value: '36.8°C',
    date: '2024-01-07',
    time: '10:00 AM',
    status: 'normal'
  },
  {
    id: '5',
    type: 'Blood Sugar',
    value: '95 mg/dL',
    date: '2024-01-06',
    time: '07:45 PM',
    status: 'normal'
  }
];

export default function MetricsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="secondary">Normal</Badge>;
      case 'warning':
        return <Badge variant="outline">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Metrics</h1>
            <p className="text-muted-foreground">
              Track and monitor your vital health measurements
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Metric</span>
          </Button>
        </div>

        {/* Metric Cards Overview */}
        <MetricCards refreshTrigger={refreshTrigger} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Weight Tracking */}
          <WeightTracker />
          
          {/* Blood Pressure Monitoring */}
          <BloodPressureMonitor />
        </div>

        {/* Activity Tracking */}
        <ActivityTracker />

        {/* Data Visualization */}
        <DataVisualization />

        {/* Recent Metrics Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Measurements</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Filter by Date
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Trends
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMetrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">{metric.type}</TableCell>
                    <TableCell>{metric.value}</TableCell>
                    <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                    <TableCell>{metric.time}</TableCell>
                    <TableCell>{getStatusBadge(metric.status)}</TableCell>
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