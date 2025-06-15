import { SyncConfig, HealthMetricType, LogLevel, BatteryOptimizationLevel } from '../types';

/**
 * Manages configuration for the wearable integration system
 */
export class ConfigManager {
  private config: SyncConfig;
  
  constructor(initialConfig?: Partial<SyncConfig>) {
    // Set default configuration
    this.config = {
      // General sync settings
      syncIntervalMinutes: 30,
      enabledMetrics: Object.values(HealthMetricType),
      syncHistoricalData: true,
      historicalDataDays: 7,
      
      // Data processing settings
      anomalyDetectionThreshold: 3.0,
      dataNormalizationRules: [],
      
      // Security settings
      backupConfig: {
        enabled: true,
        frequency: 'daily',
        retentionPeriodDays: 30,
        storageLocation: 'local',
        encryptBackups: true,
        incrementalBackups: true
      },
      encryptData: true,
      
      // Performance settings
      batteryOptimizationLevel: BatteryOptimizationLevel.MEDIUM,
      
      // Logging settings
      logLevel: LogLevel.INFO,
      
      // Platform-specific settings
      platformSpecificConfig: {}
    };
    
    // Apply initial configuration if provided
    if (initialConfig) {
      this.updateConfig(initialConfig);
    }
  }
  
  /**
   * Get the current configuration
   * @returns The current configuration
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }
  
  /**
   * Update the configuration
   * @param config New configuration options
   */
  updateConfig(config: Partial<SyncConfig>): void {
    // Update top-level properties
    Object.keys(config).forEach(key => {
      const typedKey = key as keyof SyncConfig;
      
      // Special handling for nested objects
      if (typedKey === 'backupConfig' && config.backupConfig) {
        this.config.backupConfig = {
          ...this.config.backupConfig,
          ...config.backupConfig
        };
      } else if (typedKey === 'platformSpecificConfig' && config.platformSpecificConfig) {
        this.config.platformSpecificConfig = {
          ...this.config.platformSpecificConfig,
          ...config.platformSpecificConfig
        };
      } else {
        // @ts-ignore - We know this is safe because we're iterating over keys of config
        this.config[typedKey] = config[typedKey];
      }
    });
  }
  
  /**
   * Save the configuration to persistent storage
   * @returns Promise resolving when the save is complete
   */
  async saveConfig(): Promise<void> {
    // In a real implementation, this would save to AsyncStorage, SharedPreferences, etc.
    console.log('Saving configuration to storage');
    
    try {
      // Simulate saving to storage
      localStorage.setItem('wearable_integration_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }
  
  /**
   * Load the configuration from persistent storage
   * @returns Promise resolving when the load is complete
   */
  async loadConfig(): Promise<void> {
    // In a real implementation, this would load from AsyncStorage, SharedPreferences, etc.
    console.log('Loading configuration from storage');
    
    try {
      // Simulate loading from storage
      const storedConfig = localStorage.getItem('wearable_integration_config');
      
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        this.updateConfig(parsedConfig);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }
  
  /**
   * Reset the configuration to defaults
   */
  resetToDefaults(): void {
    this.config = {
      // General sync settings
      syncIntervalMinutes: 30,
      enabledMetrics: Object.values(HealthMetricType),
      syncHistoricalData: true,
      historicalDataDays: 7,
      
      // Data processing settings
      anomalyDetectionThreshold: 3.0,
      dataNormalizationRules: [],
      
      // Security settings
      backupConfig: {
        enabled: true,
        frequency: 'daily',
        retentionPeriodDays: 30,
        storageLocation: 'local',
        encryptBackups: true,
        incrementalBackups: true
      },
      encryptData: true,
      
      // Performance settings
      batteryOptimizationLevel: BatteryOptimizationLevel.MEDIUM,
      
      // Logging settings
      logLevel: LogLevel.INFO,
      
      // Platform-specific settings
      platformSpecificConfig: {}
    };
  }
}