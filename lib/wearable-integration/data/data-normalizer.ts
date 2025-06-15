import { HealthDataPoint, HealthMetricType, DataNormalizationRule } from '../types';

/**
 * Normalizes health data points to ensure consistent units and formats
 */
export class DataNormalizer {
  private normalizationRules: Map<HealthMetricType, DataNormalizationRule[]> = new Map();
  
  constructor(rules?: DataNormalizationRule[]) {
    this.initializeDefaultRules();
    
    // Add any custom rules
    if (rules) {
      rules.forEach(rule => this.addNormalizationRule(rule));
    }
  }
  
  /**
   * Normalize a health data point
   * @param dataPoint The health data point to normalize
   * @returns The normalized health data point
   */
  normalizeDataPoint(dataPoint: HealthDataPoint): HealthDataPoint {
    // Create a copy of the data point to avoid modifying the original
    const normalizedDataPoint = { ...dataPoint };
    
    // Apply metric-specific normalization rules
    const rules = this.normalizationRules.get(dataPoint.metricType) || [];
    
    for (const rule of rules) {
      // Apply unit conversion if needed
      if (rule.unitConversion && dataPoint.unit === rule.unitConversion.fromUnit) {
        normalizedDataPoint.value = this.convertUnit(
          dataPoint.value as number,
          rule.unitConversion.conversionFactor
        );
        normalizedDataPoint.unit = rule.unitConversion.toUnit;
      }
      
      // Apply value transformation if needed
      if (rule.valueTransformation) {
        normalizedDataPoint.value = this.transformValue(
          normalizedDataPoint.value,
          rule.valueTransformation.type,
          rule.valueTransformation.parameters
        );
      }
    }
    
    return normalizedDataPoint;
  }
  
  /**
   * Add a normalization rule
   * @param rule The normalization rule to add
   */
  addNormalizationRule(rule: DataNormalizationRule): void {
    const rules = this.normalizationRules.get(rule.metricType) || [];
    rules.push(rule);
    this.normalizationRules.set(rule.metricType, rules);
  }
  
  /**
   * Remove all normalization rules for a specific metric type
   * @param metricType The metric type to remove rules for
   */
  clearNormalizationRules(metricType: HealthMetricType): void {
    this.normalizationRules.delete(metricType);
  }
  
  /**
   * Reset all normalization rules to defaults
   */
  resetToDefaults(): void {
    this.normalizationRules.clear();
    this.initializeDefaultRules();
  }
  
  /**
   * Convert a value from one unit to another
   * @param value The value to convert
   * @param conversionFactor The conversion factor to apply
   * @returns The converted value
   */
  private convertUnit(value: number, conversionFactor: number): number {
    return value * conversionFactor;
  }
  
  /**
   * Transform a value using the specified transformation
   * @param value The value to transform
   * @param transformationType The type of transformation to apply
   * @param parameters Parameters for the transformation
   * @returns The transformed value
   */
  private transformValue(value: any, transformationType: string, parameters: any): any {
    switch (transformationType) {
      case 'scale':
        return (value as number) * parameters.factor;
      case 'offset':
        return (value as number) + parameters.offset;
      case 'custom':
        // For custom transformations, parameters should include a function
        if (parameters.transform && typeof parameters.transform === 'function') {
          return parameters.transform(value);
        }
        return value;
      default:
        return value;
    }
  }
  
  /**
   * Initialize default normalization rules
   */
  private initializeDefaultRules(): void {
    // Distance: convert to meters
    this.addNormalizationRule({
      metricType: HealthMetricType.DISTANCE,
      unitConversion: {
        fromUnit: 'km',
        toUnit: 'm',
        conversionFactor: 1000
      }
    });
    
    this.addNormalizationRule({
      metricType: HealthMetricType.DISTANCE,
      unitConversion: {
        fromUnit: 'mi',
        toUnit: 'm',
        conversionFactor: 1609.34
      }
    });
    
    this.addNormalizationRule({
      metricType: HealthMetricType.DISTANCE,
      unitConversion: {
        fromUnit: 'ft',
        toUnit: 'm',
        conversionFactor: 0.3048
      }
    });
    
    // Weight: convert to kg
    this.addNormalizationRule({
      metricType: HealthMetricType.WEIGHT,
      unitConversion: {
        fromUnit: 'lb',
        toUnit: 'kg',
        conversionFactor: 0.453592
      }
    });
    
    // Temperature: convert to Celsius
    this.addNormalizationRule({
      metricType: HealthMetricType.BODY_TEMPERATURE,
      unitConversion: {
        fromUnit: 'F',
        toUnit: 'C',
        conversionFactor: 5/9
      },
      valueTransformation: {
        type: 'offset',
        parameters: { offset: -32 * (5/9) }
      }
    });
  }
}