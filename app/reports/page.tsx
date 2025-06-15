'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  Heart,
  Activity,
  Weight,
  Pill
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const reportTypes = [
  {
    id: 'health-summary',
    name: 'Health Summary',
    description: 'Comprehensive overview of all health metrics',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'vitals-report',
    name: 'Vital Signs Report',
    description: 'Blood pressure, heart rate, and temperature trends',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'activity-report',
    name: 'Activity Report',
    description: 'Physical activity and exercise tracking',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'weight-report',
    name: 'Weight & BMI Report',
    description: 'Weight tracking and body composition analysis',
    icon: Weight,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'medication-report',
    name: 'Medication Report',
    description: 'Medication adherence and schedule tracking',
    icon: Pill,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const recentReports = [
  {
    name: 'Monthly Health Summary - December 2024',
    type: 'Health Summary',
    date: '2024-12-01',
    status: 'completed',
    size: '2.4 MB'
  },
  {
    name: 'Quarterly Vitals Report - Q4 2024',
    type: 'Vital Signs Report',
    date: '2024-11-28',
    status: 'completed',
    size: '1.8 MB'
  },
  {
    name: 'Weekly Activity Report',
    type: 'Activity Report',
    date: '2024-11-25',
    status: 'completed',
    size: '1.2 MB'
  }
];

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;
    
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    
    // In a real app, this would trigger the actual report generation
    console.log('Generating report:', {
      type: selectedReportType,
      dateRange,
      startDate,
      endDate
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'generating':
        return <Badge variant="outline">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports of your health data
          </p>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generate New Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                    selectedReportType === report.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedReportType(report.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${report.bgColor} flex items-center justify-center`}>
                      <report.icon className={`w-5 h-5 ${report.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{report.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                    <SelectItem value="quarter">Last 3 months</SelectItem>
                    <SelectItem value="year">Last 12 months</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedReportType || isGenerating}
              className="w-full md:w-auto"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{report.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {report.type} • {format(new Date(report.date), 'MMM dd, yyyy')} • {report.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report.status)}
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}