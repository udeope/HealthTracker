'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useState } from 'react';

// Sample data for different chart types
const generateHealthData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: 70 - (Math.random() * 2) - (i * 0.02),
      systolic: 118 + (Math.random() - 0.5) * 10,
      diastolic: 78 + (Math.random() - 0.5) * 8,
      steps: Math.floor(Math.random() * 5000) + 6000,
      heartRate: 70 + (Math.random() - 0.5) * 10,
      sleep: 6.5 + Math.random() * 2
    });
  }
  
  return data;
};

const radarData = [
  { metric: 'Cardiovascular', value: 85, fullMark: 100 },
  { metric: 'Activity', value: 78, fullMark: 100 },
  { metric: 'Sleep', value: 82, fullMark: 100 },
  { metric: 'Nutrition', value: 75, fullMark: 100 },
  { metric: 'Mental Health', value: 88, fullMark: 100 },
  { metric: 'Medication', value: 92, fullMark: 100 }
];

export function DataVisualization() {
  const [dateRange, setDateRange] = useState('30');
  const [chartType, setChartType] = useState('line');
  const [selectedMetrics, setSelectedMetrics] = useState(['weight', 'systolic']);
  const [zoomLevel, setZoomLevel] = useState(1);

  const data = generateHealthData(parseInt(dateRange));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value.toFixed(1)}</span>
              {entry.name === 'Weight' && ' kg'}
              {(entry.name === 'Systolic' || entry.name === 'Diastolic') && ' mmHg'}
              {entry.name === 'Steps' && ' steps'}
              {entry.name === 'Heart Rate' && ' bpm'}
              {entry.name === 'Sleep' && ' hours'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartData = data.slice(-Math.floor(data.length / zoomLevel));

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.includes('weight') && (
              <Bar dataKey="weight" fill="#3b82f6" name="Weight" />
            )}
            {selectedMetrics.includes('steps') && (
              <Bar dataKey="steps" fill="#10b981" name="Steps" />
            )}
            {selectedMetrics.includes('heartRate') && (
              <Bar dataKey="heartRate" fill="#f59e0b" name="Heart Rate" />
            )}
          </BarChart>
        );
      
      case 'radar':
        return (
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Health Score"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        );
      
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.includes('weight') && (
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Weight"
              />
            )}
            {selectedMetrics.includes('systolic') && (
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Systolic"
              />
            )}
            {selectedMetrics.includes('diastolic') && (
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Diastolic"
              />
            )}
            {selectedMetrics.includes('steps') && (
              <Line
                type="monotone"
                dataKey="steps"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Steps"
              />
            )}
            {selectedMetrics.includes('heartRate') && (
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Heart Rate"
              />
            )}
            {selectedMetrics.includes('sleep') && (
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                name="Sleep"
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Data Visualization</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))}
              disabled={zoomLevel >= 4}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(1)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="radar">Radar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metric Selection */}
        {chartType !== 'radar' && (
          <Tabs defaultValue="metrics" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="metrics">Select Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics" className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'weight', label: 'Weight', color: '#3b82f6' },
                  { key: 'systolic', label: 'Systolic BP', color: '#ef4444' },
                  { key: 'diastolic', label: 'Diastolic BP', color: '#10b981' },
                  { key: 'steps', label: 'Steps', color: '#8b5cf6' },
                  { key: 'heartRate', label: 'Heart Rate', color: '#f59e0b' },
                  { key: 'sleep', label: 'Sleep', color: '#06b6d4' }
                ].map((metric) => (
                  <Button
                    key={metric.key}
                    size="sm"
                    variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
                    onClick={() => {
                      if (selectedMetrics.includes(metric.key)) {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                      } else {
                        setSelectedMetrics([...selectedMetrics, metric.key]);
                      }
                    }}
                    className="text-xs"
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: metric.color }}
                    />
                    {metric.label}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className="text-xs text-muted-foreground">
          <p>
            Showing {chartType} view for the last {dateRange} days
            {zoomLevel > 1 && ` (${zoomLevel}x zoom)`}
          </p>
          {chartType === 'radar' && (
            <p>Radar chart shows overall health scores across different categories</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}