'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Weight, Plus, Target, TrendingDown } from 'lucide-react';
import { useState } from 'react';

// Sample weight data for the last 30 days
const generateWeightData = () => {
  const data = [];
  const baseWeight = 70;
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate gradual weight loss with some fluctuation
    const trend = -0.05 * (29 - i); // Gradual decrease
    const fluctuation = (Math.random() - 0.5) * 0.8; // Random daily variation
    const weight = baseWeight + trend + fluctuation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      weight: parseFloat(weight.toFixed(1)),
      formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return data;
};

export function WeightTracker() {
  const [weightData, setWeightData] = useState(generateWeightData());
  const [newWeight, setNewWeight] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalWeight, setGoalWeight] = useState(65);

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const previousWeight = weightData[weightData.length - 8]?.weight || 0; // Week ago
  const weeklyChange = currentWeight - previousWeight;
  
  // Calculate weekly average
  const lastWeekData = weightData.slice(-7);
  const weeklyAverage = lastWeekData.reduce((sum, day) => sum + day.weight, 0) / lastWeekData.length;
  
  // Calculate progress towards goal
  const startWeight = weightData[0]?.weight || currentWeight;
  const totalProgress = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;
  const progressToGoal = Math.max(0, Math.min(100, totalProgress));

  const handleAddWeight = () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
      weight: parseFloat(newWeight),
      formattedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    
    // Remove today's entry if it exists and add new one
    const filteredData = weightData.filter(entry => entry.date !== today);
    setWeightData([...filteredData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    
    setNewWeight('');
    setIsDialogOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Weight: <span className="font-bold">{payload[0].value} kg</span>
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
            <Weight className="w-5 h-5" />
            <span>Weight Tracking</span>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Weight</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Weight</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Enter your weight"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddWeight} className="w-full">
                  Save Weight
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{currentWeight.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Current</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{weeklyAverage.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Weekly Avg</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{Math.abs(weeklyChange).toFixed(1)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Weekly Change</p>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Goal Progress</span>
            </div>
            <Badge variant="outline">{goalWeight} kg target</Badge>
          </div>
          <Progress value={progressToGoal} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{(currentWeight - goalWeight).toFixed(1)} kg to go</span>
            <span>{progressToGoal.toFixed(0)}% complete</span>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Highest (30 days)</p>
            <p className="font-semibold">{Math.max(...weightData.map(d => d.weight)).toFixed(1)} kg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lowest (30 days)</p>
            <p className="font-semibold">{Math.min(...weightData.map(d => d.weight)).toFixed(1)} kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}