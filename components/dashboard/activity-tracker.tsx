'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity, Target, Flame, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

// Sample activity data for the week
const generateWeeklyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    steps: Math.floor(Math.random() * 5000) + 6000,
    activeMinutes: Math.floor(Math.random() * 40) + 30,
    calories: Math.floor(Math.random() * 200) + 250
  }));
};

export function ActivityTracker() {
  const [currentSteps, setCurrentSteps] = useState(8432);
  const [activeMinutes, setActiveMinutes] = useState(45);
  const [caloriesBurned, setCaloriesBurned] = useState(320);
  const [weeklyData, setWeeklyData] = useState(generateWeeklyData());

  const stepGoal = 10000;
  const activeGoal = 60; // minutes
  const calorieGoal = 400;

  const stepProgress = (currentSteps / stepGoal) * 100;
  const activeProgress = (activeMinutes / activeGoal) * 100;
  const calorieProgress = (caloriesBurned / calorieGoal) * 100;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSteps(prev => prev + Math.floor(Math.random() * 10));
      setActiveMinutes(prev => prev + Math.floor(Math.random() * 2));
      setCaloriesBurned(prev => prev + Math.floor(Math.random() * 5));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getActivityLevel = () => {
    if (currentSteps >= stepGoal && activeMinutes >= activeGoal) {
      return { label: 'Excellent', variant: 'secondary' as const, color: 'text-green-600' };
    } else if (currentSteps >= stepGoal * 0.7 || activeMinutes >= activeGoal * 0.7) {
      return { label: 'Good', variant: 'outline' as const, color: 'text-blue-600' };
    } else {
      return { label: 'Needs Improvement', variant: 'destructive' as const, color: 'text-red-600' };
    }
  };

  const activityLevel = getActivityLevel();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Steps: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-green-600">
            Active: <span className="font-bold">{payload[1].value} min</span>
          </p>
          <p className="text-sm text-orange-600">
            Calories: <span className="font-bold">{payload[2].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Physical Activity</span>
          </CardTitle>
          <Badge variant={activityLevel.variant}>{activityLevel.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Progress */}
        <div className="space-y-4">
          <h4 className="font-semibold">Today's Progress</h4>
          
          {/* Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Steps</span>
              </div>
              <span className="text-sm font-bold">
                {currentSteps.toLocaleString()} / {stepGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={stepProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stepProgress >= 100 ? 'Goal achieved!' : `${(stepGoal - currentSteps).toLocaleString()} steps to go`}
            </p>
          </div>

          {/* Active Minutes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Active Minutes</span>
              </div>
              <span className="text-sm font-bold">
                {activeMinutes} / {activeGoal} min
              </span>
            </div>
            <Progress value={activeProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {activeProgress >= 100 ? 'Goal achieved!' : `${activeGoal - activeMinutes} minutes to go`}
            </p>
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Calories Burned</span>
              </div>
              <span className="text-sm font-bold">
                {caloriesBurned} / {calorieGoal} cal
              </span>
            </div>
            <Progress value={calorieProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {calorieProgress >= 100 ? 'Goal achieved!' : `${calorieGoal - caloriesBurned} calories to go`}
            </p>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div>
          <h4 className="font-semibold mb-3">Weekly Activity</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="steps" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{currentSteps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Steps Today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{activeMinutes}</p>
            <p className="text-xs text-muted-foreground">Active Minutes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-orange-600">{caloriesBurned}</p>
            <p className="text-xs text-muted-foreground">Calories Burned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}