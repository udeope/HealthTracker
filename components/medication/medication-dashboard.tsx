'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  Bell,
  Shield,
  Download
} from 'lucide-react';
import { MedicationService, type Prescription, type MedicationLog, type MedicationInventory } from '@/lib/medication-system';

interface MedicationDashboardProps {
  userId: string;
}

export function MedicationDashboard({ userId }: MedicationDashboardProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [inventory, setInventory] = useState<MedicationInventory[]>([]);
  const [adherenceData, setAdherenceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar prescripciones activas
      const activePrescriptions = await MedicationService.getActivePrescriptions(userId);
      setPrescriptions(activePrescriptions);

      // Cargar logs de hoy
      const today = new Date().toISOString().split('T')[0];
      const logs = await MedicationService.getMedicationLogs(userId, today, today);
      setTodayLogs(logs);

      // Cargar inventario
      const inventoryData = await MedicationService.getInventory(userId);
      setInventory(inventoryData);

      // Generar datos de adherencia para los últimos 7 días
      const adherenceWeekData = await generateAdherenceWeekData();
      setAdherenceData(adherenceWeekData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAdherenceWeekData = async () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const logs = await MedicationService.getMedicationLogs(userId, dateStr, dateStr);
      const taken = logs.filter(log => log.is_taken).length;
      const total = logs.length;
      const adherence = total > 0 ? (taken / total) * 100 : 0;

      data.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        adherence: Math.round(adherence),
        taken,
        total
      });
    }
    return data;
  };

  // Calcular estadísticas
  const totalMedications = prescriptions.length;
  const todayTaken = todayLogs.filter(log => log.is_taken).length;
  const todayTotal = todayLogs.length;
  const todayAdherence = todayTotal > 0 ? (todayTaken / todayTotal) * 100 : 0;
  const lowStockItems = inventory.filter(item => item.current_quantity <= item.low_stock_threshold);
  const weeklyAdherence = adherenceData.length > 0 
    ? adherenceData.reduce((sum, day) => sum + day.adherence, 0) / adherenceData.length 
    : 0;

  // Datos para gráficos
  const medicationStatusData = [
    { name: 'Tomados', value: todayTaken, color: '#10B981' },
    { name: 'Pendientes', value: todayTotal - todayTaken, color: '#F59E0B' },
    { name: 'Omitidos', value: todayLogs.filter(log => log.is_skipped).length, color: '#EF4444' }
  ];

  const inventoryStatusData = inventory.map(item => ({
    name: item.medication?.name || 'Unknown',
    quantity: item.current_quantity,
    threshold: item.low_stock_threshold,
    status: item.current_quantity <= item.low_stock_threshold ? 'low' : 'normal'
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Medicamentos Activos</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMedications}</p>
            <p className="text-xs text-muted-foreground">Prescripciones activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Adherencia Hoy</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Math.round(todayAdherence)}%</p>
            <Progress value={todayAdherence} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {todayTaken} de {todayTotal} dosis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Stock Bajo</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{lowStockItems.length}</p>
            <p className="text-xs text-muted-foreground">Medicamentos por agotar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Promedio Semanal</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Math.round(weeklyAdherence)}%</p>
            <p className="text-xs text-muted-foreground">Adherencia últimos 7 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      {(lowStockItems.length > 0 || todayAdherence < 80) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-800">Stock Bajo</p>
                  <p className="text-sm text-orange-600">
                    {lowStockItems.length} medicamento(s) necesitan reposición
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Detalles
                </Button>
              </div>
            )}
            {todayAdherence < 80 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-800">Adherencia Baja</p>
                  <p className="text-sm text-orange-600">
                    Tu adherencia de hoy está por debajo del objetivo (80%)
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Recordatorios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adherencia semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Adherencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Adherencia']}
                    labelFormatter={(label) => `Día: ${label}`}
                  />
                  <Bar dataKey="adherence" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Estado de medicamentos hoy */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={medicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {medicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicamentos de hoy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Medicamentos de Hoy</span>
            </CardTitle>
            <Button size="sm" variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Configurar Recordatorios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayLogs.length > 0 ? (
              todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      log.is_taken ? 'bg-green-100' : log.is_skipped ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <Pill className={`w-5 h-5 ${
                        log.is_taken ? 'text-green-600' : log.is_skipped ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {log.prescription?.medication?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.prescription?.dosage} - {new Date(log.scheduled_time).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.is_taken ? (
                      <Badge variant="secondary">Tomado</Badge>
                    ) : log.is_skipped ? (
                      <Badge variant="destructive">Omitido</Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                    {!log.is_taken && !log.is_skipped && (
                      <Button size="sm">
                        Marcar como Tomado
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay medicamentos programados para hoy
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estado del inventario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Estado del Inventario</span>
            </CardTitle>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Inventario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'low' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.quantity} unidades</p>
                    <p className="text-xs text-muted-foreground">
                      Mínimo: {item.threshold}
                    </p>
                  </div>
                  {item.status === 'low' && (
                    <Badge variant="destructive" className="text-xs">
                      Stock Bajo
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funciones de seguridad y cumplimiento */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Shield className="w-5 h-5" />
            <span>Seguridad y Cumplimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-blue-800">HIPAA Compliant</p>
              <p className="text-sm text-blue-600">Datos encriptados y seguros</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-blue-800">Sincronización</p>
              <p className="text-sm text-blue-600">Datos sincronizados entre dispositivos</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-blue-800">Exportación</p>
              <p className="text-sm text-blue-600">Datos exportables en PDF/CSV</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}