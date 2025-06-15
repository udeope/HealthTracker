'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { WeightTracker } from '@/components/dashboard/weight-tracker';
import { BloodPressureMonitor } from '@/components/dashboard/blood-pressure-monitor';
import { ActivityTracker } from '@/components/dashboard/activity-tracker';
import { MedicationOverview } from '@/components/dashboard/medication-overview';
import { HealthStatusIndicators } from '@/components/dashboard/health-status-indicators';
import { DataVisualization } from '@/components/dashboard/data-visualization';
import { DataExport } from '@/components/dashboard/data-export';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Dashboard</h1>
            <p className="text-muted-foreground">
              Track your health metrics and stay on top of your wellness goals
            </p>
          </div>
          <DataExport />
        </div>

        {/* Metric Cards */}
        <MetricCards refreshTrigger={refreshTrigger} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Weight & BP */}
          <div className="xl:col-span-1 space-y-8">
            <WeightTracker />
            <BloodPressureMonitor />
          </div>

          {/* Middle Column - Activity & Medication */}
          <div className="xl:col-span-1 space-y-8">
            <ActivityTracker />
            <MedicationOverview />
          </div>

          {/* Right Column - Health Status & Visualization */}
          <div className="xl:col-span-1 space-y-8">
            <HealthStatusIndicators />
            <DataVisualization />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}