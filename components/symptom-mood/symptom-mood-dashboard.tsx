'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Heart,
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  Download,
  Settings,
  Target,
  Activity,
  Clock,
  Zap
} from 'lucide-react';
import { SymptomMoodService, SymptomAnalysisService, type SymptomEntry, type MoodEntry, type SymptomPattern, type MoodCorrelation } from '@/lib/symptom-mood-system';
import { format, subDays, parseISO } from 'date-fns';

interface SymptomMoodDashboardProps {
  userId: string;
}

export function SymptomMoodDashboard({ userId }: SymptomMoodDashboardProps) {
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [patterns, setPatterns] = useState<SymptomPattern[]>([]);
  const [correlations, setCorrelations] = useState<MoodCorrelation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = subDays(new Date(), timeRange).toISOString().split('T')[0];

      const [
        symptomsData,
        moodsData,
        patternsData,
        correlationsData,
        statsData,
        riskData
      ] = await Promise.all([
        SymptomMoodService.getSymptomEntries(userId, startDate, endDate),
        SymptomMoodService.getMoodEntries(userId, startDate, endDate),
        SymptomMoodService.getSymptomPatterns(userId),
        SymptomMoodService.getMoodCorrelations(userId),
        SymptomMoodService.getSymptomStatistics(userId, timeRange),
        SymptomAnalysisService.predictSymptomRisk(userId)
      ]);

      setSymptoms(symptomsData);
      setMoods(moodsData);
      setPatterns(patternsData);
      setCorrelations(correlationsData);
      setStatistics(statsData);
      setRiskAssessment(riskData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos
  const prepareChartData = () => {
    const combinedData: any[] = [];
    const dateMap = new Map();

    // Combinar datos de síntomas y estado de ánimo por fecha
    symptoms.forEach(symptom => {
      const date = symptom.entry_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, symptoms: [], moods: [] });
      }
      dateMap.get(date).symptoms.push(symptom);
    });

    moods.forEach(mood => {
      const date = mood.entry_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, symptoms: [], moods: [] });
      }
      dateMap.get(date).moods.push(mood);
    });

    // Convertir a array y calcular promedios
    Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(dayData => {
        const avgPainIntensity = dayData.symptoms.length > 0
          ? dayData.symptoms.reduce((sum: number, s: any) => sum + (s.pain_intensity || 0), 0) / dayData.symptoms.length
          : 0;
        
        const avgMood = dayData.moods.length > 0
          ? dayData.moods.reduce((sum: number, m: any) => sum + m.overall_mood, 0) / dayData.moods.length
          : 0;

        const avgEnergy = dayData.moods.length > 0
          ? dayData.moods.reduce((sum: number, m: any) => sum + (m.energy_level || 0), 0) / dayData.moods.length
          : 0;

        const avgStress = dayData.moods.length > 0
          ? dayData.moods.reduce((sum: number, m: any) => sum + (m.stress_level || 0), 0) / dayData.moods.length
          : 0;

        combinedData.push({
          date: format(parseISO(dayData.date), 'MMM dd'),
          fullDate: dayData.date,
          painIntensity: Math.round(avgPainIntensity * 10) / 10,
          mood: Math.round(avgMood * 10) / 10,
          energy: Math.round(avgEnergy * 10) / 10,
          stress: Math.round(avgStress * 10) / 10,
          symptomCount: dayData.symptoms.length,
          moodEntries: dayData.moods.length
        });
      });

    return combinedData;
  };

  const chartData = prepareChartData();

  // Datos para gráfico de distribución de síntomas
  const symptomDistribution = statistics?.symptoms ? Object.entries(statistics.symptoms).map(([name, data]: [string, any]) => ({
    name,
    count: data.count,
    avgIntensity: Math.round(data.avgIntensity * 10) / 10
  })) : [];

  // Datos para gráfico de correlaciones
  const correlationData = correlations.map(corr => ({
    name: `${corr.factor_a} vs ${corr.factor_b}`,
    correlation: Math.round(corr.correlation_strength * 100) / 100,
    significance: corr.statistical_significance
  }));

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high': return <Badge variant="destructive">Alto Riesgo</Badge>;
      case 'medium': return <Badge variant="outline">Riesgo Moderado</Badge>;
      case 'low': return <Badge variant="secondary">Bajo Riesgo</Badge>;
      default: return <Badge variant="outline">Sin Evaluar</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controles del dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Síntomas y Estado de Ánimo</h2>
          <p className="text-muted-foreground">
            Análisis integral de tu bienestar físico y emocional
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-border rounded-md"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">Síntomas Registrados</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{symptoms.length}</p>
            <p className="text-xs text-muted-foreground">Últimos {timeRange} días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Estado de Ánimo Promedio</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {statistics?.mood ? Math.round(statistics.mood.avgMood * 10) / 10 : 'N/A'}/5
            </p>
            <p className="text-xs text-muted-foreground">
              {moods.length} registros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Patrones Detectados</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{patterns.length}</p>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Nivel de Riesgo</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {riskAssessment && getRiskBadge(riskAssessment.risk_level)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Score: {riskAssessment ? Math.round(riskAssessment.risk_score * 100) / 100 : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y recomendaciones */}
      {riskAssessment && riskAssessment.risk_level !== 'low' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Recomendaciones Basadas en el Análisis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskAssessment.recommendations.map((rec: string, index: number) => (
                <p key={index} className="text-sm text-orange-700">• {rec}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos principales */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencias de síntomas y estado de ánimo */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Temporales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="painIntensity" 
                        stroke="#ef4444" 
                        name="Intensidad del Dolor"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#3b82f6" 
                        name="Estado de Ánimo"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Energía y estrés */}
            <Card>
              <CardHeader>
                <CardTitle>Energía vs Estrés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#10b981" 
                        name="Nivel de Energía"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stress" 
                        stroke="#f59e0b" 
                        name="Nivel de Estrés"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de síntomas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Síntomas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={symptomDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Frecuencia" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Intensidad promedio por síntoma */}
            <Card>
              <CardHeader>
                <CardTitle>Intensidad Promedio por Síntoma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={symptomDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="avgIntensity" fill="#ef4444" name="Intensidad Promedio" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correlaciones Significativas</CardTitle>
            </CardHeader>
            <CardContent>
              {correlations.length > 0 ? (
                <div className="space-y-4">
                  {correlations.map((corr, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {corr.factor_a} ↔ {corr.factor_b}
                        </h4>
                        <Badge variant={Math.abs(corr.correlation_strength) > 0.5 ? "default" : "outline"}>
                          {corr.correlation_strength > 0 ? 'Positiva' : 'Negativa'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <Progress 
                            value={Math.abs(corr.correlation_strength) * 100} 
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(Math.abs(corr.correlation_strength) * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Basado en {corr.sample_size} muestras ({Math.round(corr.statistical_significance * 100)}% confianza)
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No se han detectado correlaciones significativas aún.
                  Continúa registrando datos para obtener análisis más precisos.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patrones Detectados</CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.length > 0 ? (
                <div className="space-y-4">
                  {patterns.map((pattern, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{pattern.pattern_name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{pattern.pattern_type}</Badge>
                          <Badge variant={pattern.confidence_level > 0.7 ? "default" : "outline"}>
                            {Math.round(pattern.confidence_level * 100)}% confianza
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pattern.description}
                      </p>
                      {pattern.recommendations && pattern.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Recomendaciones:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {pattern.recommendations.map((rec, recIndex) => (
                              <li key={recIndex}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No se han detectado patrones aún.
                  Los patrones se identifican automáticamente después de registrar datos durante varios días.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estadísticas detalladas */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen Estadístico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.totalSymptomEntries}
                </p>
                <p className="text-sm text-muted-foreground">Síntomas registrados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {statistics.totalMoodEntries}
                </p>
                <p className="text-sm text-muted-foreground">Estados de ánimo</p>
              </div>
              {statistics.mood && (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(statistics.mood.avgEnergy * 10) / 10}/10
                    </p>
                    <p className="text-sm text-muted-foreground">Energía promedio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.round(statistics.mood.avgStress * 10) / 10}/10
                    </p>
                    <p className="text-sm text-muted-foreground">Estrés promedio</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}