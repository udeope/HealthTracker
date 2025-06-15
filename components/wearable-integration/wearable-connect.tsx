'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Watch,
  Smartphone,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Heart,
  Activity,
  Footprints,
  Scale,
  Moon,
  Droplets,
  Thermometer
} from 'lucide-react';
import { 
  WearableIntegration, 
  WearableDataSource, 
  HealthMetricType,
  SyncStatus
} from '@/lib/wearable-integration';

export function WearableConnect() {
  const [activeTab, setActiveTab] = useState('overview');
  const [wearableManager, setWearableManager] = useState<WearableIntegration | null>(null);
  const [connectedSources, setConnectedSources] = useState<WearableDataSource[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeWearableIntegration();
  }, []);

  const initializeWearableIntegration = async () => {
    try {
      setIsInitializing(true);
      
      // Create wearable integration instance
      const integration = new WearableIntegration({
        syncIntervalMinutes: 30,
        batteryOptimizationLevel: 'medium',
        syncHistoricalData: true,
        historicalDataDays: 7
      });
      
      setWearableManager(integration);
      
      // Get initial status
      const status = integration.getSyncStatus();
      setSyncStatus(status);
      setConnectedSources(status.connectedSources);
      
      if (status.lastSyncTime) {
        setLastSyncTime(status.lastSyncTime);
      }
      
      setIsInitializing(false);
    } catch (error) {
      console.error('Failed to initialize wearable integration:', error);
      toast.error('Error initializing wearable integration');
      setIsInitializing(false);
    }
  };

  const connectSource = async (source: WearableDataSource) => {
    if (!wearableManager) return;
    
    try {
      let authConfig;
      
      switch (source) {
        case WearableDataSource.APPLE_HEALTH:
          authConfig = { userId: 'current-user-id' };
          break;
        case WearableDataSource.GOOGLE_FIT:
          authConfig = { 
            userId: 'current-user-id',
            clientId: 'your-google-client-id',
            redirectUri: 'your-redirect-uri'
          };
          break;
        case WearableDataSource.FITBIT:
          authConfig = {
            userId: 'current-user-id',
            clientId: 'your-fitbit-client-id',
            clientSecret: 'your-fitbit-client-secret',
            redirectUri: 'your-redirect-uri'
          };
          break;
      }
      
      // Initialize the connector
      const initialized = await wearableManager.initializeConnector(source, authConfig);
      
      if (initialized) {
        toast.success(`${getSourceName(source)} connected successfully`);
        
        // Update connected sources
        const sources = wearableManager.getConnectedPlatforms();
        setConnectedSources(sources);
        
        // Start sync if this is the first source
        if (sources.length === 1) {
          await wearableManager.startSync();
          const status = wearableManager.getSyncStatus();
          setSyncStatus(status);
          if (status.lastSyncTime) {
            setLastSyncTime(status.lastSyncTime);
          }
        }
      } else {
        toast.error(`Failed to connect ${getSourceName(source)}`);
      }
    } catch (error) {
      console.error(`Error connecting ${source}:`, error);
      toast.error(`Error connecting ${getSourceName(source)}`);
    }
  };

  const disconnectSource = async (source: WearableDataSource) => {
    if (!wearableManager) return;
    
    try {
      const revoked = await wearableManager.revokeAuthorization(source);
      
      if (revoked) {
        toast.success(`${getSourceName(source)} disconnected`);
        
        // Update connected sources
        const sources = wearableManager.getConnectedPlatforms();
        setConnectedSources(sources);
        
        // Stop sync if no sources left
        if (sources.length === 0) {
          wearableManager.stopSync();
          setSyncStatus(wearableManager.getSyncStatus());
        }
      } else {
        toast.error(`Failed to disconnect ${getSourceName(source)}`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${source}:`, error);
      toast.error(`Error disconnecting ${getSourceName(source)}`);
    }
  };

  const syncNow = async () => {
    if (!wearableManager) return;
    
    try {
      setIsSyncing(true);
      
      const status = await wearableManager.syncNow();
      setSyncStatus(status);
      
      if (status.lastSyncTime) {
        setLastSyncTime(status.lastSyncTime);
      }
      
      toast.success('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Error during synchronization');
    } finally {
      setIsSyncing(false);
    }
  };

  const getSourceName = (source: WearableDataSource): string => {
    switch (source) {
      case WearableDataSource.APPLE_HEALTH:
        return 'Apple Health';
      case WearableDataSource.GOOGLE_FIT:
        return 'Google Fit';
      case WearableDataSource.FITBIT:
        return 'Fitbit';
      default:
        return source;
    }
  };

  const getSourceIcon = (source: WearableDataSource) => {
    switch (source) {
      case WearableDataSource.APPLE_HEALTH:
        return <Heart className="w-5 h-5 text-red-500" />;
      case WearableDataSource.GOOGLE_FIT:
        return <Activity className="w-5 h-5 text-blue-500" />;
      case WearableDataSource.FITBIT:
        return <Watch className="w-5 h-5 text-purple-500" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getMetricIcon = (metricType: HealthMetricType) => {
    switch (metricType) {
      case HealthMetricType.STEPS:
        return <Footprints className="w-4 h-4 text-blue-500" />;
      case HealthMetricType.HEART_RATE:
        return <Heart className="w-4 h-4 text-red-500" />;
      case HealthMetricType.SLEEP_SESSION:
        return <Moon className="w-4 h-4 text-purple-500" />;
      case HealthMetricType.WEIGHT:
        return <Scale className="w-4 h-4 text-green-500" />;
      case HealthMetricType.WATER_INTAKE:
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case HealthMetricType.BODY_TEMPERATURE:
        return <Thermometer className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Wearable Device Integration</h2>
          <p className="text-muted-foreground">
            Connect and sync data from your wearable devices and health apps
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={syncNow}
            disabled={isSyncing || connectedSources.length === 0}
            className="flex items-center space-x-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Sync Now</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="text-lg font-semibold mb-1">Sync Status</h3>
              <div className="flex items-center space-x-2">
                {syncStatus?.isRunning ? (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Syncing</span>
                  </Badge>
                ) : connectedSources.length > 0 ? (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Ready</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>No Devices Connected</span>
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Connected Devices:</span>
                <span className="font-medium">{connectedSources.length}</span>
              </div>
              {lastSyncTime && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">{formatDate(lastSyncTime)}</span>
                </div>
              )}
              {syncStatus?.nextSyncTime && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Next Sync:</span>
                  <span className="font-medium">{formatDate(syncStatus.nextSyncTime)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Connected Devices Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Health Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {connectedSources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {connectedSources.map((source) => (
                    <div key={source} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getSourceIcon(source)}
                      </div>
                      <div>
                        <p className="font-medium">{getSourceName(source)}</p>
                        <p className="text-sm text-muted-foreground">Connected</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your wearable devices or health apps to start syncing data
                  </p>
                  <Button onClick={() => setActiveTab('devices')}>
                    Connect a Device
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Statistics */}
          {syncStatus?.lastSyncStats && (
            <Card>
              <CardHeader>
                <CardTitle>Last Sync Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Data Points</p>
                      <p className="text-2xl font-bold">{syncStatus.lastSyncStats.totalSynced}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Anomalies Detected</p>
                      <p className="text-2xl font-bold">{syncStatus.lastSyncStats.anomaliesDetected}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Errors</p>
                      <p className="text-2xl font-bold">{syncStatus.lastSyncStats.errors.length}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Data by Metric Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(syncStatus.lastSyncStats.syncedByMetricType)
                        .filter(([_, count]) => count > 0)
                        .map(([metric, count]) => (
                          <div key={metric} className="flex items-center space-x-2 p-3 border rounded-lg">
                            {getMetricIcon(metric as HealthMetricType)}
                            <div>
                              <p className="text-sm font-medium">{formatMetricName(metric)}</p>
                              <p className="text-xs text-muted-foreground">{count} points</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Errors and Warnings */}
                  {(syncStatus.lastSyncStats.errors.length > 0 || syncStatus.lastSyncStats.warnings.length > 0) && (
                    <div className="space-y-3">
                      {syncStatus.lastSyncStats.errors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            Sync Errors
                          </h4>
                          <ul className="space-y-1 text-xs text-red-700">
                            {syncStatus.lastSyncStats.errors.map((error, index) => (
                              <li key={index}>
                                • {error.errorMessage} ({getSourceName(error.source)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {syncStatus.lastSyncStats.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Sync Warnings
                          </h4>
                          <ul className="space-y-1 text-xs text-yellow-700">
                            {syncStatus.lastSyncStats.warnings.map((warning, index) => (
                              <li key={index}>
                                • {warning.warningMessage} ({getSourceName(warning.source)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Apple Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Apple Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect to Apple Health to sync your health and fitness data from your iPhone and Apple Watch.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  {connectedSources.includes(WearableDataSource.APPLE_HEALTH) ? (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Connected</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <XCircle className="w-3 h-3" />
                      <span>Disconnected</span>
                    </Badge>
                  )}
                </div>
                {connectedSources.includes(WearableDataSource.APPLE_HEALTH) ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => disconnectSource(WearableDataSource.APPLE_HEALTH)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => connectSource(WearableDataSource.APPLE_HEALTH)}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Google Fit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span>Google Fit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect to Google Fit to sync your health and fitness data from your Android devices and apps.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  {connectedSources.includes(WearableDataSource.GOOGLE_FIT) ? (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Connected</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <XCircle className="w-3 h-3" />
                      <span>Disconnected</span>
                    </Badge>
                  )}
                </div>
                {connectedSources.includes(WearableDataSource.GOOGLE_FIT) ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => disconnectSource(WearableDataSource.GOOGLE_FIT)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => connectSource(WearableDataSource.GOOGLE_FIT)}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Fitbit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Watch className="w-5 h-5 text-purple-500" />
                  <span>Fitbit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect to Fitbit to sync your health and fitness data from your Fitbit devices.
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  {connectedSources.includes(WearableDataSource.FITBIT) ? (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Connected</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <XCircle className="w-3 h-3" />
                      <span>Disconnected</span>
                    </Badge>
                  )}
                </div>
                {connectedSources.includes(WearableDataSource.FITBIT) ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => disconnectSource(WearableDataSource.FITBIT)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => connectSource(WearableDataSource.FITBIT)}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Data Types */}
          <Card>
            <CardHeader>
              <CardTitle>Available Data Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Footprints className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Steps</p>
                    <p className="text-xs text-muted-foreground">Daily step count</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">Heart Rate</p>
                    <p className="text-xs text-muted-foreground">Beats per minute</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Activity</p>
                    <p className="text-xs text-muted-foreground">Active minutes</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Sleep</p>
                    <p className="text-xs text-muted-foreground">Sleep duration & quality</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Scale className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Weight</p>
                    <p className="text-xs text-muted-foreground">Body weight & BMI</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Hydration</p>
                    <p className="text-xs text-muted-foreground">Water intake</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg flex items-center space-x-3">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">Body Temperature</p>
                    <p className="text-xs text-muted-foreground">Temperature readings</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sync Frequency</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    defaultValue="30"
                    onChange={(e) => {
                      if (wearableManager) {
                        wearableManager.updateConfig({
                          syncIntervalMinutes: parseInt(e.target.value)
                        });
                      }
                    }}
                  >
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                    <option value="120">Every 2 hours</option>
                    <option value="360">Every 6 hours</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Battery Optimization</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    defaultValue="medium"
                    onChange={(e) => {
                      if (wearableManager) {
                        wearableManager.updateConfig({
                          batteryOptimizationLevel: e.target.value as any
                        });
                      }
                    }}
                  >
                    <option value="none">None (Maximum Data)</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Battery Saver)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Historical Data</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="syncHistorical"
                    defaultChecked={true}
                    onChange={(e) => {
                      if (wearableManager) {
                        wearableManager.updateConfig({
                          syncHistoricalData: e.target.checked
                        });
                      }
                    }}
                  />
                  <label htmlFor="syncHistorical" className="text-sm">Sync historical data when connecting a new device</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Historical Data Period</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  defaultValue="7"
                  onChange={(e) => {
                    if (wearableManager) {
                      wearableManager.updateConfig({
                        historicalDataDays: parseInt(e.target.value)
                      });
                    }
                  }}
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Security</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="encryptData"
                    defaultChecked={true}
                    onChange={(e) => {
                      if (wearableManager) {
                        wearableManager.updateConfig({
                          encryptData: e.target.checked
                        });
                      }
                    }}
                  />
                  <label htmlFor="encryptData" className="text-sm">Encrypt health data</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Backups</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="enableBackups"
                    defaultChecked={true}
                    onChange={(e) => {
                      if (wearableManager) {
                        wearableManager.updateConfig({
                          backupConfig: {
                            enabled: e.target.checked
                          }
                        });
                      }
                    }}
                  />
                  <label htmlFor="enableBackups" className="text-sm">Enable automatic backups</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatMetricName(metric: string): string {
  // Convert SNAKE_CASE to Title Case
  return metric
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}