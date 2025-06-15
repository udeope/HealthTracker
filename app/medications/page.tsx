'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MedicationOverview } from '@/components/dashboard/medication-overview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pill, Plus, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const medications = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Johnson',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    refillDate: '2024-02-15',
    pillsRemaining: 15,
    status: 'active'
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    prescribedBy: 'Dr. Smith',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    refillDate: '2024-02-20',
    pillsRemaining: 25,
    status: 'active'
  },
  {
    id: '3',
    name: 'Vitamin D',
    dosage: '1000 IU',
    frequency: 'Once daily',
    prescribedBy: 'Dr. Johnson',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    refillDate: '2024-03-01',
    pillsRemaining: 45,
    status: 'active'
  }
];

export default function MedicationsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary">Active</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      case 'discontinued':
        return <Badge variant="destructive">Discontinued</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRefillStatus = (pillsRemaining: number) => {
    if (pillsRemaining <= 7) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (pillsRemaining <= 14) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medications</h1>
            <p className="text-muted-foreground">
              Manage your medications and track adherence
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Active Medications</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{medications.filter(m => m.status === 'active').length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Today's Adherence</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">92%</p>
              <Progress value={92} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Refill Alerts</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{medications.filter(m => m.pillsRemaining <= 14).length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Weekly Average</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">89%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Medication List */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead>Refill Status</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell className="font-medium">{medication.name}</TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>{medication.frequency}</TableCell>
                        <TableCell>{medication.prescribedBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getRefillStatus(medication.pillsRemaining)}
                            <span className="text-sm">{medication.pillsRemaining} pills</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(medication.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div className="xl:col-span-1">
            <MedicationOverview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}