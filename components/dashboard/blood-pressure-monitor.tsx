'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Heart, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// Sample BP data
const generateBPData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate realistic BP readings
    const baseSystolic = 118 + (Math.random() - 0.5) * 10;
    const baseDiastolic = 78 + (Math.random() - 0.5) * 8;
    
    data.push({
      date: date.toISOString().split('T')[0],
      systolic: Math.round(baseSystolic),
      diastolic: Math.round(baseDiastolic),
      formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`
    });
  }
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export function BloodPressureMonitor() {
  const [bpData, setBpData] = useState(generateBPData());
  const [newSystolic, setNewSystolic] = useState('');
  const [newDiastolic, setNewDiastolic] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const latestReading = bpData[0];

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) {
      return { category: 'Hypertensive Crisis', color: 'destructive', risk: 'critical' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { category: 'High Blood Pressure', color: 'destructive', risk: 'high' };
    } else if (systolic >= 130 || diastolic >= 80) {
      return { category: 'Elevated', color: 'outline', risk: 'moderate' };
    } else {
      return { category: 'Normal', color: 'secondary', risk: 'low' };
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'moderate':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
  };

  const handleAddReading = () => {
    if (!newSystolic || !newDiastolic || isNaN(parseInt(newSystolic)) || isNaN(parseInt(newDiastolic))) return;
    
    const today = new Date();
    const newEntry = {
      date: today.toISOString().split('T')[0],
      systolic: parseInt(newSystolic),
      diastolic: parseInt(newDiastolic),
      formattedDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
    
    setBpData([newEntry, ...bpData]);
    setNewSystolic('');
    setNewDiastolic('');
    setIsDialogOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-red-600">
            Systolic: <span className="font-bold">{payload[0].value} mmHg</span>
          </p>
          <p className="text-sm text-blue-600">
            Diastolic: <span className="font-bold">{payload[1].value} mmHg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const currentCategory = getBPCategory(latestReading.systolic, latestReading.diastolic);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Blood Pressure</span>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Reading</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Blood Pressure</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systolic">Systolic (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      value={newSystolic}
                      onChange={(e) => setNewSystolic(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      value={newDiastolic}
                      onChange={(e) => setNewDiastolic(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddReading} className="w-full">
                  Save Reading
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Reading */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {latestReading.systolic}/{latestReading.diastolic}
            <span className="text-lg text-muted-foreground ml-2">mmHg</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            {getRiskIcon(currentCategory.risk)}
            <Badge variant={currentCategory.color as any}>
              {currentCategory.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Last reading: {latestReading.formattedDate} at {latestReading.time}
          </p>
        </div>

        {/* BP Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bpData.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[60, 160]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="2 2" />
              <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="2 2" />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Readings Table */}
        <div>
          <h4 className="font-semibold mb-3">Recent Readings</h4>
          <div className="max-h-48 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reading</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bpData.slice(0, 5).map((reading, index) => {
                  const category = getBPCategory(reading.systolic, reading.diastolic);
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{reading.formattedDate}</TableCell>
                      <TableCell className="text-sm">{reading.time}</TableCell>
                      <TableCell className="font-medium">
                        {reading.systolic}/{reading.diastolic}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getRiskIcon(category.risk)}
                          <span className="text-xs">{category.category}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}