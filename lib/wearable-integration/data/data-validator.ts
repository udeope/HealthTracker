import { HealthDataPoint, HealthMetricType } from '../types';

/**
 * Validates health data points to ensure they meet quality standards
 */
export class DataValidator {
  private validationRules: Map<HealthMetricType, ValidationRule[]> = new Map();
  
  constructor() {
    this.initializeDefaultRules();
  }
  
  /**
   * Validate a health data point
   * @param dataPoint The health data point to validate
   * @returns true if the data point is valid
   */
  validateDataPoint(dataPoint: HealthDataPoint): boolean {
    // Basic validation for all data points
    if (!this.validateBasicRequirements(dataPoint)) {
      return false;
    }
    
    // Apply metric-specific validation rules
    const rules = this.validationRules.get(dataPoint.metricType) || [];
    
    for (const rule of rules) {
      if (!rule.validate(dataPoint)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Add a validation rule for a specific metric type
   * @param metricType The metric type to add a rule for
   * @param rule The validation rule
   */
  addValidationRule(metricType: HealthMetricType, rule: ValidationRule): void {
    const rules = this.validationRules.get(metricType) || [];
    rules.push(rule);
    this.validationRules.set(metricType, rules);
  }
  
  /**
   * Remove all validation rules for a specific metric type
   * @param metricType The metric type to remove rules for
   */
  clearValidationRules(metricType: HealthMetricType): void {
    this.validationRules.delete(metricType);
  }
  
  /**
   * Reset all validation rules to defaults
   */
  resetToDefaults(): void {
    this.validationRules.clear();
    this.initializeDefaultRules();
  }
  
  /**
   * Validate basic requirements for all data points
   * @param dataPoint The health data point to validate
   * @returns true if the data point meets basic requirements
   */
  private validateBasicRequirements(dataPoint: HealthDataPoint): boolean {
    // Check required fields
    if (!dataPoint.id || !dataPoint.userId || !dataPoint.source || 
        !dataPoint.metricType || !dataPoint.timestamp || 
        dataPoint.value === undefined || dataPoint.value === null || 
        !dataPoint.unit || !dataPoint.syncTimestamp) {
      return false;
    }
    
    // Check timestamp format and validity
    try {
      const timestamp = new Date(dataPoint.timestamp);
      const syncTimestamp = new Date(dataPoint.syncTimestamp);
      
      // Timestamp should be in the past
      if (timestamp > new Date()) {
        return false;
      }
      
      // Sync timestamp should be after the data timestamp
      if (syncTimestamp < timestamp) {
        return false;
      }
    } catch (error) {
      // Invalid date format
      return false;
    }
    
    return true;
  }
  
  /**
   * Initialize default validation rules for common metric types
   */
  private initializeDefaultRules(): void {
    // Steps
    this.addValidationRule(HealthMetricType.STEPS, {
      validate: (dataPoint) => {
        const value = dataPoint.value as number;
        return value >= 0 && value <= 100000; // Max 100,000 steps in a day
      }
    });
    
    // Heart rate
    this.addValidationRule(HealthMetricType.HEART_RATE, {
      validate: (dataPoint) => {
        const value = dataPoint.value as number;
        return value >= 30 && value <= 220; // Reasonable heart rate range
      }
    });
    
    // Blood pressure
    this.addValidationRule(HealthMetricType.BLOOD_PRESSURE, {
      validate: (dataPoint) => {
        const value = dataPoint.value as { systolic: number, diastolic: number };
        return (
          value.systolic >= 70 && value.systolic <= 250 && // Reasonable systolic range
          value.diastolic >= 40 && value.diastolic <= 150 && // Reasonable diastolic range
          value.systolic > value.diastolic // Systolic should be higher than diastolic
        );
      }
    });
    
    // Weight
    this.addValidationRule(HealthMetricType.WEIGHT, {
      validate: (dataPoint) => {
        const value = dataPoint.value as number;
        return value > 0 && value < 500; // 0-500 kg
      }
    });
    
    // Sleep
    this.addValidationRule(HealthMetricType.SLEEP_SESSION, {
      validate: (dataPoint) => {
        const value = dataPoint.value as number;
        return value >= 0 && value <= 24 * 60; // 0-24 hours in minutes
      }
    });
  }
}

/**
 * Interface for validation rules
 */
export interface ValidationRule {
  validate: (dataPoint: HealthDataPoint) => boolean;
}