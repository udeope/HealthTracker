/**
 * Core types for the wearable integration system
 */

// Supported wearable data sources
export enum WearableDataSource {
  APPLE_HEALTH = 'apple_health',
  GOOGLE_FIT = 'google_fit',
  FITBIT = 'fitbit'
}

// Health metric types that can be synchronized
export enum HealthMetricType {
  // Activity metrics
  STEPS = 'steps',
  DISTANCE = 'distance',
  ACTIVE_MINUTES = 'active_minutes',
  CALORIES_BURNED = 'calories_burned',
  FLOORS_CLIMBED = 'floors_climbed',
  
  // Vital metrics
  HEART_RATE = 'heart_rate',
  BLOOD_PRESSURE = 'blood_pressure',
  BLOOD_OXYGEN = 'blood_oxygen',
  RESPIRATORY_RATE = 'respiratory_rate',
  BODY_TEMPERATURE = 'body_temperature',
  
  // Sleep metrics
  SLEEP_SESSION = 'sleep_session',
  SLEEP_STAGES = 'sleep_stages',
  
  // Body metrics
  WEIGHT = 'weight',
  BODY_FAT = 'body_fat',
  BMI = 'bmi',
  
  // Nutrition metrics
  WATER_INTAKE = 'water_intake',
  NUTRITION = 'nutrition',
  
  // Other metrics
  ECG = 'ecg',
  STRESS_LEVEL = 'stress_level',
  MINDFULNESS_MINUTES = 'mindfulness_minutes'
}

// Sync configuration
export interface SyncConfig {
  // General sync settings
  syncIntervalMinutes: number;
  enabledMetrics: HealthMetricType[];
  syncHistoricalData: boolean;
  historicalDataDays: number;
  
  // Data processing settings
  anomalyDetectionThreshold: number;
  dataNormalizationRules: DataNormalizationRule[];
  
  // Security settings
  backupConfig: BackupConfig;
  encryptData: boolean;
  
  // Performance settings
  batteryOptimizationLevel: BatteryOptimizationLevel;
  
  // Logging settings
  logLevel: LogLevel;
  
  // Platform-specific settings
  platformSpecificConfig: {
    [WearableDataSource.APPLE_HEALTH]?: AppleHealthConfig;
    [WearableDataSource.GOOGLE_FIT]?: GoogleFitConfig;
    [WearableDataSource.FITBIT]?: FitbitConfig;
  };
}

// Data normalization rule
export interface DataNormalizationRule {
  metricType: HealthMetricType;
  unitConversion?: {
    fromUnit: string;
    toUnit: string;
    conversionFactor: number;
  };
  valueTransformation?: {
    type: 'scale' | 'offset' | 'custom';
    parameters: any;
  };
}

// Backup configuration
export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriodDays: number;
  storageLocation: 'local' | 'cloud';
  encryptBackups: boolean;
  incrementalBackups: boolean;
}

// Battery optimization levels
export enum BatteryOptimizationLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Platform-specific configurations
export interface AppleHealthConfig {
  permissions: {
    read: HealthMetricType[];
    write: HealthMetricType[];
  };
  backgroundDelivery: boolean;
}

export interface GoogleFitConfig {
  scopes: string[];
  requestPermissions: boolean;
}

export interface FitbitConfig {
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

// Health data point
export interface HealthDataPoint {
  id: string;
  userId: string;
  source: WearableDataSource;
  sourceDeviceId?: string;
  metricType: HealthMetricType;
  timestamp: string;
  value: number | object;
  unit: string;
  syncTimestamp: string;
  isManualEntry?: boolean;
  metadata?: any;
}

// Sync status
export interface SyncStatus {
  isRunning: boolean;
  lastSyncTime?: string;
  nextSyncTime?: string;
  connectedSources: WearableDataSource[];
  lastSyncStats?: {
    totalSynced: number;
    syncedByMetricType: Record<HealthMetricType, number>;
    errors: SyncError[];
    warnings: SyncWarning[];
    anomaliesDetected: number;
  };
}

// Sync error
export interface SyncError {
  source: WearableDataSource;
  metricType?: HealthMetricType;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
}

// Sync warning
export interface SyncWarning {
  source: WearableDataSource;
  metricType?: HealthMetricType;
  warningCode: string;
  warningMessage: string;
  timestamp: string;
}

// OAuth configuration
export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint?: string;
}

// Base connector interface
export interface WearableConnector {
  initialize(): Promise<boolean>;
  authorize(): Promise<boolean>;
  isAuthorized(): Promise<boolean>;
  revokeAuthorization(): Promise<boolean>;
  fetchData(metricType: HealthMetricType, startTime?: string, endTime?: string): Promise<HealthDataPoint[]>;
  getSupportedMetrics(): HealthMetricType[];
}