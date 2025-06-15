import { 
  HealthMetricType, 
  WearableDataSource, 
  HealthDataPoint, 
  SyncConfig,
  SyncStatus,
  SyncError,
  SyncWarning
} from '../types';
import { DataValidator } from '../data/data-validator';
import { DataNormalizer } from '../data/data-normalizer';
import { AnomalyDetector } from '../data/anomaly-detector';
import { BackupManager } from '../security/backup-manager';
import { SyncLogger } from '../utils/sync-logger';
import { BatteryOptimizer } from '../utils/battery-optimizer';

interface DataSyncManagerConfig {
  syncInterval: number;
  validator: DataValidator;
  normalizer: DataNormalizer;
  anomalyDetector: AnomalyDetector;
  backupManager: BackupManager;
  logger: SyncLogger;
  batteryOptimizer: BatteryOptimizer;
}

/**
 * Manages the synchronization of health data from wearable devices
 */
export class DataSyncManager {
  private connectors: Map<WearableDataSource, any> = new Map();
  private syncIntervalId: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = null;
  private nextSyncTime: Date | null = null;
  private config: DataSyncManagerConfig;
  private syncStatus: SyncStatus = {
    isRunning: false,
    connectedSources: []
  };
  
  constructor(config: DataSyncManagerConfig) {
    this.config = config;
  }
  
  /**
   * Register a wearable connector
   * @param source The wearable data source
   * @param connector The connector instance
   */
  registerConnector(source: WearableDataSource, connector: any): void {
    this.connectors.set(source, connector);
    this.syncStatus.connectedSources = Array.from(this.connectors.keys());
    this.config.logger.info(`Registered connector for ${source}`);
  }
  
  /**
   * Unregister a wearable connector
   * @param source The wearable data source to unregister
   */
  unregisterConnector(source: WearableDataSource): void {
    this.connectors.delete(source);
    this.syncStatus.connectedSources = Array.from(this.connectors.keys());
    this.config.logger.info(`Unregistered connector for ${source}`);
  }
  
  /**
   * Start automatic synchronization
   * @returns Promise resolving when sync is started
   */
  async startSync(): Promise<void> {
    if (this.syncIntervalId) {
      this.config.logger.warn('Sync already running');
      return;
    }
    
    this.syncStatus.isRunning = true;
    
    // Perform initial sync
    await this.syncNow();
    
    // Schedule regular syncs
    this.syncIntervalId = setInterval(async () => {
      // Check if battery optimization allows syncing
      if (this.config.batteryOptimizer.canSync()) {
        await this.syncNow();
      } else {
        this.config.logger.info('Skipping sync due to battery optimization');
      }
    }, this.config.syncInterval * 60 * 1000);
    
    this.config.logger.info(`Automatic sync started with interval of ${this.config.syncInterval} minutes`);
  }
  
  /**
   * Stop automatic synchronization
   */
  stopSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      this.syncStatus.isRunning = false;
      this.config.logger.info('Automatic sync stopped');
    }
  }
  
  /**
   * Manually trigger a synchronization
   * @param metricTypes Optional array of specific metric types to sync
   * @returns Promise resolving to a SyncStatus object
   */
  async syncNow(metricTypes?: HealthMetricType[]): Promise<SyncStatus> {
    if (this.isSyncing) {
      this.config.logger.warn('Sync already in progress');
      return this.syncStatus;
    }
    
    this.isSyncing = true;
    const startTime = new Date();
    this.config.logger.info('Starting sync', { metricTypes });
    
    const errors: SyncError[] = [];
    const warnings: SyncWarning[] = [];
    let totalSynced = 0;
    let anomaliesDetected = 0;
    const syncedByMetricType: Record<HealthMetricType, number> = {} as Record<HealthMetricType, number>;
    
    try {
      // Determine which metrics to sync
      const metricsToSync = metricTypes || this.getAllSupportedMetrics();
      
      // Initialize sync stats for each metric type
      metricsToSync.forEach(metricType => {
        syncedByMetricType[metricType] = 0;
      });
      
      // Sync each metric type from each connector
      for (const [source, connector] of this.connectors.entries()) {
        const supportedMetrics = connector.getSupportedMetrics();
        
        for (const metricType of metricsToSync) {
          // Skip if this connector doesn't support this metric
          if (!supportedMetrics.includes(metricType)) {
            continue;
          }
          
          try {
            // Determine time range for sync
            const lastDay = new Date();
            lastDay.setDate(lastDay.getDate() - 1);
            const startTimeStr = lastDay.toISOString();
            const endTimeStr = new Date().toISOString();
            
            // Fetch data from the connector
            const dataPoints = await connector.fetchData(metricType, startTimeStr, endTimeStr);
            
            // Process the data points
            const processedData = await this.processDataPoints(source, metricType, dataPoints);
            
            // Update sync stats
            totalSynced += processedData.validCount;
            syncedByMetricType[metricType] += processedData.validCount;
            anomaliesDetected += processedData.anomaliesCount;
            
            // Add any warnings
            warnings.push(...processedData.warnings);
            
            this.config.logger.info(`Synced ${processedData.validCount} ${metricType} data points from ${source}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.config.logger.error(`Error syncing ${metricType} from ${source}:`, error);
            
            errors.push({
              source,
              metricType,
              errorCode: 'SYNC_ERROR',
              errorMessage,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      // Create backup if needed
      if (totalSynced > 0) {
        try {
          await this.config.backupManager.createBackupIfNeeded();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.config.logger.error('Error creating backup:', error);
          
          errors.push({
            source: WearableDataSource.APPLE_HEALTH, // Placeholder
            errorCode: 'BACKUP_ERROR',
            errorMessage,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Update sync status
      this.lastSyncTime = new Date();
      this.nextSyncTime = new Date(Date.now() + (this.config.syncInterval * 60 * 1000));
      
      this.syncStatus.lastSyncTime = this.lastSyncTime.toISOString();
      this.syncStatus.nextSyncTime = this.nextSyncTime.toISOString();
      this.syncStatus.lastSyncStats = {
        totalSynced,
        syncedByMetricType,
        errors,
        warnings,
        anomaliesDetected
      };
      
      const syncDuration = (new Date().getTime() - startTime.getTime()) / 1000;
      this.config.logger.info(`Sync completed in ${syncDuration.toFixed(2)}s`, this.syncStatus.lastSyncStats);
      
      return this.syncStatus;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.config.logger.error('Unexpected error during sync:', error);
      
      errors.push({
        source: WearableDataSource.APPLE_HEALTH, // Placeholder
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage,
        timestamp: new Date().toISOString()
      });
      
      this.syncStatus.lastSyncStats = {
        totalSynced,
        syncedByMetricType,
        errors,
        warnings,
        anomaliesDetected
      };
      
      return this.syncStatus;
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Get the current sync status
   * @returns The current sync status
   */
  getStatus(): SyncStatus {
    return this.syncStatus;
  }
  
  /**
   * Update the sync configuration
   * @param config New configuration options
   */
  updateConfig(config: SyncConfig): void {
    // Update sync interval if it changed
    if (config.syncIntervalMinutes !== this.config.syncInterval) {
      this.config.syncInterval = config.syncIntervalMinutes;
      
      // Restart sync if it's running
      if (this.syncIntervalId) {
        this.stopSync();
        this.startSync();
      }
    }
    
    this.config.logger.info('Sync configuration updated');
  }
  
  /**
   * Process data points through validation, normalization, and anomaly detection
   * @param source The data source
   * @param metricType The metric type
   * @param dataPoints The data points to process
   * @returns Object with processed data stats
   */
  private async processDataPoints(
    source: WearableDataSource,
    metricType: HealthMetricType,
    dataPoints: HealthDataPoint[]
  ): Promise<{
    validCount: number;
    invalidCount: number;
    anomaliesCount: number;
    warnings: SyncWarning[];
  }> {
    const warnings: SyncWarning[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let anomaliesCount = 0;
    
    // Process each data point
    for (const dataPoint of dataPoints) {
      // Validate the data point
      const isValid = this.config.validator.validateDataPoint(dataPoint);
      
      if (!isValid) {
        invalidCount++;
        warnings.push({
          source,
          metricType,
          warningCode: 'INVALID_DATA',
          warningMessage: `Invalid data point for ${metricType}`,
          timestamp: new Date().toISOString()
        });
        continue;
      }
      
      // Normalize the data point
      const normalizedDataPoint = this.config.normalizer.normalizeDataPoint(dataPoint);
      
      // Check for anomalies
      const isAnomaly = this.config.anomalyDetector.detectAnomaly(normalizedDataPoint);
      
      if (isAnomaly) {
        anomaliesCount++;
        warnings.push({
          source,
          metricType,
          warningCode: 'ANOMALY_DETECTED',
          warningMessage: `Anomaly detected in ${metricType} data`,
          timestamp: new Date().toISOString()
        });
      }
      
      // In a real implementation, we would save the data point to the database here
      
      validCount++;
    }
    
    return {
      validCount,
      invalidCount,
      anomaliesCount,
      warnings
    };
  }
  
  /**
   * Get all supported metrics across all connectors
   * @returns Array of all supported health metric types
   */
  private getAllSupportedMetrics(): HealthMetricType[] {
    const metrics = new Set<HealthMetricType>();
    
    for (const connector of this.connectors.values()) {
      const supportedMetrics = connector.getSupportedMetrics();
      supportedMetrics.forEach(metric => metrics.add(metric));
    }
    
    return Array.from(metrics);
  }
}