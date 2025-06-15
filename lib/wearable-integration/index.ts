// Wearable Integration System - Main Entry Point
// This module serves as the central hub for all wearable device integrations

import { AppleHealthConnector } from './connectors/apple-health';
import { GoogleFitConnector } from './connectors/google-fit';
import { FitbitConnector } from './connectors/fitbit';
import { DataSyncManager } from './sync/data-sync-manager';
import { DataValidator } from './data/data-validator';
import { DataNormalizer } from './data/data-normalizer';
import { AnomalyDetector } from './data/anomaly-detector';
import { BackupManager } from './security/backup-manager';
import { SyncLogger } from './utils/sync-logger';
import { BatteryOptimizer } from './utils/battery-optimizer';
import { ConfigManager } from './utils/config-manager';
import { HealthMetricType, WearableDataSource, SyncConfig, SyncStatus } from './types';

/**
 * Main class for managing wearable device integrations
 * Provides a unified interface for all supported platforms
 */
export class WearableIntegration {
  private connectors: Map<WearableDataSource, any> = new Map();
  private syncManager: DataSyncManager;
  private validator: DataValidator;
  private normalizer: DataNormalizer;
  private anomalyDetector: AnomalyDetector;
  private backupManager: BackupManager;
  private logger: SyncLogger;
  private batteryOptimizer: BatteryOptimizer;
  private configManager: ConfigManager;
  
  constructor(config?: Partial<SyncConfig>) {
    // Initialize configuration
    this.configManager = new ConfigManager(config);
    const syncConfig = this.configManager.getConfig();
    
    // Initialize components
    this.logger = new SyncLogger(syncConfig.logLevel);
    this.validator = new DataValidator();
    this.normalizer = new DataNormalizer();
    this.anomalyDetector = new AnomalyDetector(syncConfig.anomalyDetectionThreshold);
    this.backupManager = new BackupManager(syncConfig.backupConfig);
    this.batteryOptimizer = new BatteryOptimizer(syncConfig.batteryOptimizationLevel);
    
    // Initialize sync manager
    this.syncManager = new DataSyncManager({
      syncInterval: syncConfig.syncIntervalMinutes,
      validator: this.validator,
      normalizer: this.normalizer,
      anomalyDetector: this.anomalyDetector,
      backupManager: this.backupManager,
      logger: this.logger,
      batteryOptimizer: this.batteryOptimizer
    });
    
    this.logger.info('WearableIntegration initialized with configuration:', syncConfig);
  }
  
  /**
   * Initialize a specific wearable platform connector
   * @param platform The wearable platform to initialize
   * @param authConfig Authentication configuration for the platform
   * @returns Promise resolving to true if initialization was successful
   */
  async initializeConnector(platform: WearableDataSource, authConfig: any): Promise<boolean> {
    this.logger.info(`Initializing connector for ${platform}`);
    
    try {
      let connector;
      
      switch (platform) {
        case WearableDataSource.APPLE_HEALTH:
          connector = new AppleHealthConnector(authConfig);
          break;
        case WearableDataSource.GOOGLE_FIT:
          connector = new GoogleFitConnector(authConfig);
          break;
        case WearableDataSource.FITBIT:
          connector = new FitbitConnector(authConfig);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      await connector.initialize();
      this.connectors.set(platform, connector);
      this.syncManager.registerConnector(platform, connector);
      
      this.logger.info(`Successfully initialized connector for ${platform}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to initialize connector for ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Start the automatic synchronization process
   * @returns Promise resolving to true if sync started successfully
   */
  async startSync(): Promise<boolean> {
    if (this.connectors.size === 0) {
      this.logger.warn('No connectors initialized. Cannot start sync.');
      return false;
    }
    
    try {
      await this.syncManager.startSync();
      this.logger.info('Synchronization started successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to start synchronization:', error);
      return false;
    }
  }
  
  /**
   * Stop the automatic synchronization process
   */
  stopSync(): void {
    this.syncManager.stopSync();
    this.logger.info('Synchronization stopped');
  }
  
  /**
   * Manually trigger a synchronization
   * @param metricTypes Optional array of specific metric types to sync
   * @returns Promise resolving to a SyncStatus object
   */
  async syncNow(metricTypes?: HealthMetricType[]): Promise<SyncStatus> {
    try {
      const result = await this.syncManager.syncNow(metricTypes);
      this.logger.info('Manual sync completed', result);
      return result;
    } catch (error) {
      this.logger.error('Manual sync failed:', error);
      throw error;
    }
  }
  
  /**
   * Get the current sync status
   * @returns The current sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncManager.getStatus();
  }
  
  /**
   * Update the sync configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.configManager.updateConfig(config);
    const newConfig = this.configManager.getConfig();
    
    // Update components with new config
    this.syncManager.updateConfig(newConfig);
    this.anomalyDetector.updateThreshold(newConfig.anomalyDetectionThreshold);
    this.backupManager.updateConfig(newConfig.backupConfig);
    this.batteryOptimizer.updateOptimizationLevel(newConfig.batteryOptimizationLevel);
    
    this.logger.info('Configuration updated:', newConfig);
  }
  
  /**
   * Revoke authorization for a specific platform
   * @param platform The platform to revoke authorization for
   * @returns Promise resolving to true if revocation was successful
   */
  async revokeAuthorization(platform: WearableDataSource): Promise<boolean> {
    const connector = this.connectors.get(platform);
    if (!connector) {
      this.logger.warn(`No connector found for ${platform}`);
      return false;
    }
    
    try {
      await connector.revokeAuthorization();
      this.connectors.delete(platform);
      this.syncManager.unregisterConnector(platform);
      this.logger.info(`Authorization revoked for ${platform}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to revoke authorization for ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Get the list of currently connected platforms
   * @returns Array of connected wearable platforms
   */
  getConnectedPlatforms(): WearableDataSource[] {
    return Array.from(this.connectors.keys());
  }
  
  /**
   * Get the sync logs
   * @param limit Optional limit on the number of logs to retrieve
   * @returns Array of log entries
   */
  getSyncLogs(limit?: number): any[] {
    return this.logger.getLogs(limit);
  }
}

// Export all components for advanced usage
export * from './types';
export * from './connectors/apple-health';
export * from './connectors/google-fit';
export * from './connectors/fitbit';
export * from './sync/data-sync-manager';
export * from './data/data-validator';
export * from './data/data-normalizer';
export * from './data/anomaly-detector';
export * from './security/backup-manager';
export * from './utils/sync-logger';
export * from './utils/battery-optimizer';
export * from './utils/config-manager';