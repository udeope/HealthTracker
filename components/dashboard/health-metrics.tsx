'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Weight,
  Activity,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const metrics = [
  {
    title: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    trend: 'stable',
    trendValue: 0,
    status: 'normal',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    progress: 85
  },
  {
    title: 'Weight',
    value: '68.5',
    unit: 'kg',
    trend: 'down',
    trendValue: -0.5,
    status: 'goal',
    icon: Weight,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    progress: 78
  },
  {
    title: 'Steps Today',
    value: '8,432',
    unit: 'steps',
    trend: 'up',
    trendValue: 12,
    status: 'active',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    progress: 84
  },
  {
    title: 'Body Temperature',
    value: '36.8',
    unit: '°C',
    trend: 'stable',
    trendValue: 0,
    status: 'normal',
    icon: Thermometer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    progress: 92
  }
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    normal: { label: 'Normal', variant: 'secondary' as const },
    goal: { label: 'On Track', variant: 'default' as const },
    active: { label: 'Active', variant: 'secondary' as const },
    warning: { label: 'Attention', variant: 'destructive' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function HealthMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              {getStatusBadge(metric.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-foreground">
                  {metric.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {metric.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getTrendIcon(metric.trend)}
                <span className="text-sm text-muted-foreground">
                  {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}
                  {metric.trend !== 'stable' && '%'} vs last week
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal Progress</span>
                <span className="font-medium">{metric.progress}%</span>
              </div>
              <Progress value={metric.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}