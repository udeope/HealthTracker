'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WearableConnect } from '@/components/wearable-integration/wearable-connect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Watch,
  Smartphone,
  Heart,
  Activity,
  Footprints,
  Scale,
  Moon,
  Droplets,
  Thermometer,
  RefreshCw,
  ArrowRight,
  Shield,
  Battery,
  Zap,
  Server
} from 'lucide-react';

export default function WearablesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wearable Devices</h1>
          <p className="text-muted-foreground">
            Connect and manage your wearable devices and health apps
          </p>
        </div>

        {/* Feature Overview */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Watch className="w-5 h-5" />
              <span>Wearable Integration System</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Multiple Platforms</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Seamlessly connect with Apple Health, Google Fit, and Fitbit to sync your health data.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Automatic Syncing</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your health data syncs automatically every 30 minutes with customizable frequency.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Secure & Private</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  End-to-end encryption and secure backups keep your health data safe and private.
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <Battery className="w-8 h-8 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Battery Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent battery optimization ensures minimal impact on your device's battery life while maintaining data accuracy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Zap className="w-8 h-8 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Data Validation & Anomaly Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced algorithms validate data integrity and detect anomalies to ensure your health metrics are accurate.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Wearable Connect Component */}
        <WearableConnect />

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Health Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our system syncs a comprehensive range of health metrics from your connected devices:
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Footprints className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Steps & Distance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Heart Rate & ECG</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Sleep Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Weight & Body Composition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Body Temperature</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Hydration</span>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Health Metrics
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-xs text-muted-foreground">End-to-end encryption</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Automatic Backups</p>
                    <p className="text-xs text-muted-foreground">Daily incremental backups</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Data Retention</p>
                    <p className="text-xs text-muted-foreground">How long we keep your data</p>
                  </div>
                </div>
                <Badge variant="outline">30 Days</Badge>
              </div>
              
              <Button variant="outline" className="w-full">
                Manage Data Settings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}