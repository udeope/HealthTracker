'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Weight,
  Heart,
  Activity,
  Pill,
  TrendingUp,
  TrendingDown,
  Minus,
  Target
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface MetricCardsProps {
  refreshTrigger: number;
}

const calculateBMI = (weight: number, height: number) => {
  return (weight / ((height / 100) ** 2)).toFixed(1);
};

const getHealthScore = (metrics: any) => {
  // Simplified health score calculation
  let score = 100;
  
  // BMI factor
  const bmi = parseFloat(metrics.bmi);
  if (bmi < 18.5 || bmi > 25) score -= 15;
  else if (bmi >= 18.5 && bmi <= 24.9) score += 5;
  
  // Blood pressure factor
  if (metrics.bloodPressure.systolic > 140 || metrics.bloodPressure.diastolic > 90) score -= 20;
  else if (metrics.bloodPressure.systolic <= 120 && metrics.bloodPressure.diastolic <= 80) score += 5;
  
  // Activity factor
  if (metrics.steps < 5000) score -= 10;
  else if (metrics.steps >= 10000) score += 10;
  
  // Medication adherence factor
  if (metrics.medicationAdherence < 80) score -= 15;
  else if (metrics.medicationAdherence >= 95) score += 10;
  
  return Math.max(0, Math.min(100, score));
};

export function MetricCards({ refreshTrigger }: MetricCardsProps) {
  const [metrics, setMetrics] = useState({
    weight: 68.5,
    height: 165, // cm
    bloodPressure: { systolic: 120, diastolic: 80 },
    steps: 8432,
    activeMinutes: 45,
    medicationAdherence: 92
  });

  const [trends, setTrends] = useState({
    weight: 'down',
    bloodPressure: 'stable',
    steps: 'up',
    medicationAdherence: 'up'
  });

  useEffect(() => {
    // Simulate real-time data updates
    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 100),
        activeMinutes: prev.activeMinutes + Math.floor(Math.random() * 5)
      }));
    };

    updateMetrics();
  }, [refreshTrigger]);

  const bmi = calculateBMI(metrics.weight, metrics.height);
  const healthScore = getHealthScore({ ...metrics, bmi });

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

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', variant: 'destructive' as const };
    if (bmi <= 24.9) return { label: 'Normal', variant: 'secondary' as const };
    if (bmi <= 29.9) return { label: 'Overweight', variant: 'outline' as const };
    return { label: 'Obese', variant: 'destructive' as const };
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { label: 'High', variant: 'destructive' as const };
    if (systolic >= 130 || diastolic >= 80) return { label: 'Elevated', variant: 'outline' as const };
    return { label: 'Normal', variant: 'secondary' as const };
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const metricCards = [
    {
      title: 'Weight & BMI',
      value: `${metrics.weight} kg`,
      secondaryValue: `BMI: ${bmi}`,
      trend: trends.weight,
      status: getBMIStatus(parseFloat(bmi)),
      icon: Weight,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      progress: 75
    },
    {
      title: 'Blood Pressure',
      value: `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`,
      secondaryValue: 'mmHg',
      trend: trends.bloodPressure,
      status: getBPStatus(metrics.bloodPressure.systolic, metrics.bloodPressure.diastolic),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      progress: 85
    },
    {
      title: 'Daily Activity',
      value: metrics.steps.toLocaleString(),
      secondaryValue: `${metrics.activeMinutes} active min`,
      trend: trends.steps,
      status: { label: metrics.steps >= 10000 ? 'Goal Met' : 'In Progress', variant: metrics.steps >= 10000 ? 'secondary' as const : 'outline' as const },
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      progress: Math.min(100, (metrics.steps / 10000) * 100)
    },
    {
      title: 'Medication',
      value: `${metrics.medicationAdherence}%`,
      secondaryValue: 'adherence rate',
      trend: trends.medicationAdherence,
      status: { label: metrics.medicationAdherence >= 90 ? 'Excellent' : 'Good', variant: metrics.medicationAdherence >= 90 ? 'secondary' as const : 'outline' as const },
      icon: Pill,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      progress: metrics.medicationAdherence
    },
    {
      title: 'Health Score',
      value: healthScore.toString(),
      secondaryValue: '/100 points',
      trend: 'stable',
      status: { label: healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention', variant: healthScore >= 80 ? 'secondary' as const : healthScore >= 60 ? 'outline' as const : 'destructive' as const },
      icon: Target,
      color: getHealthScoreColor(healthScore),
      bgColor: 'bg-orange-50',
      progress: healthScore
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <Badge variant={metric.status.variant}>{metric.status.label}</Badge>
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
                  {metric.secondaryValue}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getTrendIcon(metric.trend)}
              <span className="text-sm text-muted-foreground">
                vs last week
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(metric.progress)}%</span>
              </div>
              <Progress value={metric.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}