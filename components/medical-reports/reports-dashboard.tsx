'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  FileText,
  Search,
  Filter,
  Download,
  Share,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { MedicalReportsService, type MedicalReport, type SearchCriteria } from '@/lib/medical-reports-system';

interface ReportsDashboardProps {
  userId: string;
}

export function ReportsDashboard({ userId }: ReportsDashboardProps) {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadReports();
  }, [userId]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, selectedStatus, selectedType, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Simular carga de reportes
      const mockReports = generateMockReports(userId);
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.summary.key_findings.some(finding =>
          finding.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.report_type === selectedType);
    }

    // Filtrar por rango de fechas
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter(report =>
        parseISO(report.created_at) >= cutoffDate
      );
    }

    setFilteredReports(filtered);
  };

  const generateMockReports = (userId: string): MedicalReport[] => {
    const mockReports: MedicalReport[] = [];
    const reportTypes = ['cardiology', 'neurology', 'general', 'endocrinology'];
    const statuses: Array<'draft' | 'completed' | 'signed' | 'shared'> = ['draft', 'completed', 'signed', 'shared'];

    for (let i = 0; i < 15; i++) {
      const createdDate = subDays(new Date(), Math.floor(Math.random() * 90));
      const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      mockReports.push({
        id: `report-${i + 1}`,
        user_id: userId,
        template_id: `template-${reportType}`,
        report_type: reportType,
        title: `Reporte ${reportType} - ${format(createdDate, 'dd/MM/yyyy')}`,
        content: {
          fields: {},
          charts: [],
          tables: [],
          images: [],
          summary: {
            key_findings: [
              'Signos vitales dentro de rangos normales',
              'Adherencia a medicamentos del 95%',
              'Mejora en indicadores de bienestar'
            ],
            health_indicators: [],
            risk_assessment: {
              overall_risk: 'low',
              risk_factors: [],
              protective_factors: []
            },
            trend_analysis: {
              improving_metrics: [],
              stable_metrics: [],
              declining_metrics: []
            },
            recommendations: []
          },
          recommendations: [],
          attachments: []
        },
        metadata: {
          patient_info: {
            id: userId,
            name: 'Paciente Ejemplo',
            date_of_birth: '1980-01-01',
            gender: 'M',
            medical_record_number: 'MR001'
          },
          provider_info: {
            id: 'provider-1',
            name: 'Dr. Juan Pérez',
            specialty: reportType,
            license_number: 'LIC123',
            institution: 'Hospital Central'
          },
          report_period: {
            start: format(subDays(createdDate, 30), 'yyyy-MM-dd'),
            end: format(createdDate, 'yyyy-MM-dd')
          },
          data_sources: ['vitals', 'medications', 'symptoms'],
          generation_method: 'automatic',
          quality_score: 70 + Math.floor(Math.random() * 30),
          tags: [reportType, 'routine'],
          keywords: ['health', 'monitoring']
        },
        security: {
          encryption_level: 'AES-256',
          access_log: [],
          sharing_permissions: [],
          watermark: {
            text: 'CONFIDENCIAL',
            position: 'diagonal',
            opacity: 0.1,
            font_size: 12,
            color: '#666666'
          },
          compliance_flags: []
        },
        status,
        version: 1,
        created_at: createdDate.toISOString(),
        updated_at: createdDate.toISOString(),
        generated_by: 'system'
      });
    }

    return mockReports.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', variant: 'outline' as const, color: 'text-gray-600' },
      completed: { label: 'Completado', variant: 'secondary' as const, color: 'text-blue-600' },
      signed: { label: 'Firmado', variant: 'default' as const, color: 'text-green-600' },
      shared: { label: 'Compartido', variant: 'secondary' as const, color: 'text-purple-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Datos para gráficos
  const reportsByType = reports.reduce((acc, report) => {
    acc[report.report_type] = (acc[report.report_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(reportsByType).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const reportsByMonth = reports.reduce((acc, report) => {
    const month = format(parseISO(report.created_at), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(reportsByMonth).map(([month, count]) => ({
    month,
    reports: count
  }));

  const qualityDistribution = reports.reduce((acc, report) => {
    const range = Math.floor(report.metadata.quality_score / 10) * 10;
    const key = `${range}-${range + 9}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const qualityChartData = Object.entries(qualityDistribution).map(([range, count]) => ({
    range,
    count
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Total Reportes</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Últimos 90 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Completados</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {reports.filter(r => r.status === 'completed' || r.status === 'signed').length}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round((reports.filter(r => r.status === 'completed' || r.status === 'signed').length / reports.length) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Calidad Promedio</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(reports.reduce((sum, r) => sum + r.metadata.quality_score, 0) / reports.length)}
            </p>
            <p className="text-xs text-muted-foreground">Puntuación sobre 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Último Reporte</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {reports.length > 0 ? format(parseISO(reports[0].created_at), 'dd/MM') : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              {reports.length > 0 ? format(parseISO(reports[0].created_at), 'MMM yyyy') : 'Sin reportes'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="signed">Firmado</SelectItem>
                  <SelectItem value="shared">Compartido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="cardiology">Cardiología</SelectItem>
                  <SelectItem value="neurology">Neurología</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="endocrinology">Endocrinología</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Reportes</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Calidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-sm text-muted-foreground">
                            v{report.version} • {report.metadata.generation_method}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.report_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${getQualityColor(report.metadata.quality_score)}`}>
                            {report.metadata.quality_score}
                          </span>
                          <Progress 
                            value={report.metadata.quality_score} 
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {format(parseISO(report.created_at), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(report.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Reporte
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="w-4 h-4 mr-2" />
                              Compartir
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="w-5 h-5" />
                  <span>Reportes por Tipo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tendencia mensual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Tendencia Mensual</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reports" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribución de calidad */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de rendimiento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo promedio de generación</span>
                    <span className="font-medium">2.3 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa de completitud</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reportes firmados</span>
                    <span className="font-medium">
                      {reports.filter(r => r.status === 'signed').length} / {reports.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reportes compartidos</span>
                    <span className="font-medium">
                      {reports.filter(r => r.status === 'shared').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Plantillas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Plantillas de Reportes</h3>
                <p className="text-muted-foreground mb-4">
                  Gestiona y personaliza las plantillas para diferentes tipos de reportes médicos
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}