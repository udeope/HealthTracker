'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Heart,
  Activity,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';

// Sample data for charts
const bloodPressureData = [
  { date: '2024-01-01', systolic: 118, diastolic: 78 },
  { date: '2024-01-02', systolic: 120, diastolic: 80 },
  { date: '2024-01-03', systolic: 122, diastolic: 82 },
  { date: '2024-01-04', systolic: 119, diastolic: 79 },
  { date: '2024-01-05', systolic: 121, diastolic: 81 },
  { date: '2024-01-06', systolic: 118, diastolic: 78 },
  { date: '2024-01-07', systolic: 120, diastolic: 80 }
];

const weightData = [
  { date: '2024-01-01', weight: 69.2 },
  { date: '2024-01-02', weight: 69.0 },
  { date: '2024-01-03', weight: 68.8 },
  { date: '2024-01-04', weight: 68.9 },
  { date: '2024-01-05', weight: 68.7 },
  { date: '2024-01-06', weight: 68.6 },
  { date: '2024-01-07', weight: 68.5 }
];

const activityData = [
  { day: 'Mon', steps: 8420, calories: 320 },
  { day: 'Tue', steps: 9150, calories: 380 },
  { day: 'Wed', steps: 7800, calories: 290 },
  { day: 'Thu', steps: 8900, calories: 340 },
  { day: 'Fri', steps: 9500, calories: 410 },
  { day: 'Sat', steps: 10200, calories: 450 },
  { day: 'Sun', steps: 8432, calories: 325 }
];

const medicationData = [
  { name: 'Taken on Time', value: 85, color: '#10B981' },
  { name: 'Taken Late', value: 10, color: '#F59E0B' },
  { name: 'Missed', value: 5, color: '#EF4444' }
];

const insights = [
  {
    type: 'positive',
    title: 'Blood Pressure Stable',
    description: 'Your blood pressure has remained within normal range for the past week.',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    type: 'achievement',
    title: 'Step Goal Achieved',
    description: 'You\'ve reached your daily step goal 5 out of 7 days this week!',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    type: 'warning',
    title: 'Medication Reminder',
    description: 'You missed your evening medication yesterday. Set up reminders?',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export function HealthInsights() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Health Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Insights */}
            <div className="space-y-4">
              <h3 className="font-semibold">Key Insights</h3>
              <div className="grid gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${insight.bgColor} border-l-4 border-l-current`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${insight.color}`}>
                        <insight.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Avg. Steps/Day</span>
                </div>
                <p className="text-2xl font-bold">8,914</p>
                <p className="text-xs text-muted-foreground">+12% vs last week</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Avg. BP</span>
                </div>
                <p className="text-2xl font-bold">120/80</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Goals Met</span>
                </div>
                <p className="text-2xl font-bold">4/5</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blood Pressure Chart */}
              <div>
                <h3 className="font-semibold mb-4">Blood Pressure Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bloodPressureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="systolic" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="diastolic" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weight Chart */}
              <div>
                <h3 className="font-semibold mb-4">Weight Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-4">Weekly Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="steps" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medication Adherence */}
              <div>
                <h3 className="font-semibold mb-4">Medication Adherence</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={medicationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {medicationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Medication Schedule */}
              <div>
                <h3 className="font-semibold mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Lisinopril', time: '8:00 AM', taken: true },
                    { name: 'Metformin', time: '12:00 PM', taken: true },
                    { name: 'Vitamin D', time: '6:00 PM', taken: false },
                    { name: 'Lisinopril', time: '8:00 PM', taken: false }
                  ].map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.time}</p>
                      </div>
                      <Badge variant={med.taken ? "secondary" : "outline"}>
                        {med.taken ? "Taken" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}