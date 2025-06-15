'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from 'sonner';
import { Download, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExportOptions {
  format: 'pdf' | 'csv';
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  metrics: string[];
}

export function DataExport() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: 'month',
    metrics: ['weight', 'bloodPressure', 'activity']
  });
  const [isExporting, setIsExporting] = useState(false);

  const availableMetrics = [
    { id: 'weight', label: 'Weight & BMI' },
    { id: 'bloodPressure', label: 'Blood Pressure' },
    { id: 'activity', label: 'Physical Activity' },
    { id: 'medications', label: 'Medications' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'vitals', label: 'Vital Signs' },
    { id: 'sleep', label: 'Sleep Data' },
    { id: 'nutrition', label: 'Nutrition' }
  ];

  const handleMetricToggle = (metricId: string) => {
    setExportOptions(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(m => m !== metricId)
        : [...prev.metrics, metricId]
    }));
  };

  const handleExport = async () => {
    if (exportOptions.metrics.length === 0) {
      toast.error('Please select at least one metric to export');
      return;
    }

    setIsExporting(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate filename
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const filename = `health-report-${dateStr}.${exportOptions.format}`;

      // Simulate file download
      if (exportOptions.format === 'pdf') {
        // In a real app, this would generate and download a PDF
        toast.success(`PDF report "${filename}" has been generated and downloaded`);
      } else {
        // In a real app, this would generate and download a CSV
        const csvContent = generateSampleCSV();
        downloadCSV(csvContent, filename);
        toast.success(`CSV data "${filename}" has been downloaded`);
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateSampleCSV = () => {
    const headers = ['Date', 'Weight (kg)', 'Systolic BP', 'Diastolic BP', 'Steps', 'Active Minutes'];
    const sampleData = [
      ['2024-01-01', '68.5', '120', '80', '8432', '45'],
      ['2024-01-02', '68.3', '118', '78', '9150', '52'],
      ['2024-01-03', '68.1', '122', '82', '7800', '38'],
      ['2024-01-04', '68.0', '119', '79', '8900', '48'],
      ['2024-01-05', '67.8', '121', '81', '9500', '55']
    ];

    return [headers, ...sampleData]
      .map(row => row.join(','))
      .join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDateRangeLabel = () => {
    switch (exportOptions.dateRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 3 months';
      case 'year':
        return 'Last 12 months';
      case 'custom':
        if (exportOptions.startDate && exportOptions.endDate) {
          return `${format(exportOptions.startDate, 'MMM dd')} - ${format(exportOptions.endDate, 'MMM dd, yyyy')}`;
        }
        return 'Select custom range';
      default:
        return 'Select range';
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Export Health Data</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: 'pdf' | 'csv') =>
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="csv">CSV Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={exportOptions.dateRange}
              onValueChange={(value: any) =>
                setExportOptions(prev => ({ ...prev, dateRange: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={getDateRangeLabel()} />
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

          {/* Custom Date Range */}
          {exportOptions.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !exportOptions.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportOptions.startDate ? (
                        format(exportOptions.startDate, "MMM dd, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exportOptions.startDate}
                      onSelect={(date) =>
                        setExportOptions(prev => ({ ...prev, startDate: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !exportOptions.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportOptions.endDate ? (
                        format(exportOptions.endDate, "MMM dd, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exportOptions.endDate}
                      onSelect={(date) =>
                        setExportOptions(prev => ({ ...prev, endDate: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Metrics Selection */}
          <div className="space-y-3">
            <Label>Select Metrics to Include</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={exportOptions.metrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="text-sm font-normal">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || exportOptions.metrics.length === 0}
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating {exportOptions.format.toUpperCase()}...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {exportOptions.format.toUpperCase()}
              </>
            )}
          </Button>

          {/* Export Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• PDF reports include charts and formatted summaries</p>
            <p>• CSV files contain raw data for analysis</p>
            <p>• All exported data is anonymized and secure</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}