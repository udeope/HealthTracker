import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { HealthMetrics } from '@/components/dashboard/health-metrics';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { HealthInsights } from '@/components/dashboard/health-insights';

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, Sarah
          </h1>
          <p className="text-muted-foreground">
            Here's your health overview for today
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Health Metrics Grid */}
        <HealthMetrics />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HealthInsights />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}