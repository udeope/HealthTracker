import { HealthDataPoint, HealthMetricType } from '../types';

/**
 * Detects anomalies in health data points
 */
export class AnomalyDetector {
  private threshold: number;
  private historicalData: Map<HealthMetricType, HealthDataPoint[]> = new Map();
  private metricRanges: Map<HealthMetricType, { min: number, max: number }> = new Map();
  
  constructor(threshold: number = 3.0) {
    this.threshold = threshold;
    this.initializeMetricRanges();
  }
  
  /**
   * Detect if a data point is an anomaly
   * @param dataPoint The health data point to check
   * @returns true if the data point is an anomaly
   */
  detectAnomaly(dataPoint: HealthDataPoint): boolean {
    // Skip anomaly detection for complex data types
    if (typeof dataPoint.value !== 'number') {
      return false;
    }
    
    // Check if the value is outside the expected range for this metric
    const range = this.metricRanges.get(dataPoint.metricType);
    if (range && (dataPoint.value < range.min || dataPoint.value > range.max)) {
      return true;
    }
    
    // Get historical data for this metric
    const history = this.historicalData.get(dataPoint.metricType) || [];
    
    // If we don't have enough historical data, just add this point and return false
    if (history.length < 10) {
      this.addToHistory(dataPoint);
      return false;
    }
    
    // Calculate mean and standard deviation of historical data
    const values = history.map(dp => dp.value as number);
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStandardDeviation(values, mean);
    
    // Calculate z-score
    const zScore = Math.abs((dataPoint.value as number - mean) / stdDev);
    
    // Add this data point to history
    this.addToHistory(dataPoint);
    
    // Return true if z-score exceeds threshold
    return zScore > this.threshold;
  }
  
  /**
   * Update the anomaly detection threshold
   * @param threshold The new threshold value
   */
  updateThreshold(threshold: number): void {
    this.threshold = threshold;
  }
  
  /**
   * Clear historical data for a specific metric type
   * @param metricType The metric type to clear history for
   */
  clearHistory(metricType: HealthMetricType): void {
    this.historicalData.delete(metricType);
  }
  
  /**
   * Clear all historical data
   */
  clearAllHistory(): void {
    this.historicalData.clear();
  }
  
  /**
   * Add a data point to the historical data
   * @param dataPoint The data point to add
   */
  private addToHistory(dataPoint: HealthDataPoint): void {
    if (typeof dataPoint.value !== 'number') {
      return;
    }
    
    const history = this.historicalData.get(dataPoint.metricType) || [];
    
    // Add the new data point
    history.push(dataPoint);
    
    // Keep only the most recent 100 data points
    if (history.length > 100) {
      history.shift();
    }
    
    this.historicalData.set(dataPoint.metricType, history);
  }
  
  /**
   * Calculate the mean of an array of numbers
   * @param values The array of numbers
   * @returns The mean value
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
  
  /**
   * Calculate the standard deviation of an array of numbers
   * @param values The array of numbers
   * @param mean The mean value (optional, will be calculated if not provided)
   * @returns The standard deviation
   */
  private calculateStandardDeviation(values: number[], mean?: number): number {
    if (values.length === 0) return 0;
    
    const avg = mean !== undefined ? mean : this.calculateMean(values);
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    
    const avgSquareDiff = this.calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }
  
  /**
   * Initialize expected value ranges for different metric types
   */
  private initializeMetricRanges(): void {
    // Activity metrics
    this.metricRanges.set(HealthMetricType.STEPS, { min: 0, max: 100000 });
    this.metricRanges.set(HealthMetricType.DISTANCE, { min: 0, max: 100000 }); // meters
    this.metricRanges.set(HealthMetricType.ACTIVE_MINUTES, { min: 0, max: 1440 }); // minutes in a day
    this.metricRanges.set(HealthMetricType.CALORIES_BURNED, { min: 0, max: 10000 });
    this.metricRanges.set(HealthMetricType.FLOORS_CLIMBED, { min: 0, max: 1000 });
    
    // Vital metrics
    this.metricRanges.set(HealthMetricType.HEART_RATE, { min: 30, max: 220 }); // bpm
    this.metricRanges.set(HealthMetricType.BLOOD_OXYGEN, { min: 80, max: 100 }); // percentage
    this.metricRanges.set(HealthMetricType.RESPIRATORY_RATE, { min: 8, max: 30 }); // breaths per minute
    this.metricRanges.set(HealthMetricType.BODY_TEMPERATURE, { min: 35, max: 42 }); // Celsius
    
    // Sleep metrics
    this.metricRanges.set(HealthMetricType.SLEEP_SESSION, { min: 0, max: 24 * 60 }); // minutes
    
    // Body metrics
    this.metricRanges.set(HealthMetricType.WEIGHT, { min: 20, max: 300 }); // kg
    this.metricRanges.set(HealthMetricType.BODY_FAT, { min: 3, max: 60 }); // percentage
    this.metricRanges.set(HealthMetricType.BMI, { min: 10, max: 50 });
    
    // Nutrition metrics
    this.metricRanges.set(HealthMetricType.WATER_INTAKE, { min: 0, max: 10000 }); // ml
    
    // Other metrics
    this.metricRanges.set(HealthMetricType.STRESS_LEVEL, { min: 0, max: 100 }); // percentage
  }
}