'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Download,
  Mail,
  Phone,
  Users,
  FileText,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useRouter } from 'next/navigation';
import {
  getHospitalPatients,
  exportHospitalPatients,
  notifyPatient,
  notifyPatientsBulk,
  type HospitalPatient,
} from '@/lib/api/hospital';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function HospitalPatientsPage() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated, isLoading } = useHospitalSession();
  const [patients, setPatients] = useState<HospitalPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<HospitalPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    registeredPatients: 0,
    csvUploadPatients: 0,
    totalRecords: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [notifying, setNotifying] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/hospital/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (hospitalId && apiKey && isAuthenticated) {
      loadPatients();
    }
  }, [hospitalId, apiKey, isAuthenticated]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        (p) =>
          p.upi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.hospitalPatientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.phone && p.phone.includes(searchTerm))
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    if (!hospitalId || !apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getHospitalPatients(hospitalId, apiKey);
      setPatients(data.patients);
      setFilteredPatients(data.patients);
      setStats({
        totalPatients: data.totalPatients,
        registeredPatients: data.registeredPatients,
        csvUploadPatients: data.csvUploadPatients,
        totalRecords: data.totalRecords,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!hospitalId || !apiKey) return;
    setExporting(true);
    try {
      const data = await exportHospitalPatients(hospitalId, apiKey, format);
      if (format === 'csv') {
        const blob = data as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patients-${hospitalId}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const jsonData = data as any;
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patients-${hospitalId}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to export patients');
    } finally {
      setExporting(false);
    }
  };

  const handleNotify = async (upi: string) => {
    if (!hospitalId || !apiKey) return;
    setNotifying(upi);
    try {
      const result = await notifyPatient(hospitalId, apiKey, upi);
      alert(
        `Notification sent!\nEmail: ${result.notifications.email?.success ? '✓' : '✗'}\nSMS: ${result.notifications.sms?.success ? '✓' : '✗'}`
      );
      if (result.notifications.email?.method === 'console_fallback' || result.notifications.sms?.method === 'console_fallback') {
        alert('Note: Email/SMS service not configured. Check server console for notification details.');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to send notification');
    } finally {
      setNotifying(null);
    }
  };

  const handleNotifyBulk = async () => {
    if (!hospitalId || !apiKey || selectedPatients.size === 0) return;
    if (!confirm(`Send notifications to ${selectedPatients.size} patients?`)) return;
    setNotifying('bulk');
    try {
      const result = await notifyPatientsBulk(hospitalId, apiKey, Array.from(selectedPatients));
      alert(
        `Bulk notification complete!\nSuccessful: ${result.successful}\nFailed: ${result.failed}`
      );
      setSelectedPatients(new Set());
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to send bulk notifications');
    } finally {
      setNotifying(null);
    }
  };

  const copyUPI = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUPI(upi);
    setTimeout(() => setCopiedUPI(null), 2000);
  };

  const toggleSelectPatient = (upi: string) => {
    const newSelected = new Set(selectedPatients);
    if (newSelected.has(upi)) {
      newSelected.delete(upi);
    } else {
      newSelected.add(upi);
    }
    setSelectedPatients(newSelected);
  };

  const selectAll = () => {
    if (selectedPatients.size === filteredPatients.length) {
      setSelectedPatients(new Set());
    } else {
      setSelectedPatients(new Set(filteredPatients.map((p) => p.upi)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Patient Management</h1>
              <p className="text-muted-foreground">View and manage all your patients</p>
            </div>
            <div className="flex gap-2">
              <Link href="/hospital/patients/register">
                <Button>Register Patient</Button>
              </Link>
              <Link href="/hospital/patients/bulk">
                <Button variant="outline">Bulk Upload</Button>
              </Link>
              <Link href="/hospital/patients/lookup">
                <Button variant="outline">Lookup Patient</Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <p className="text-2xl font-bold">{stats.totalPatients}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="text-2xl font-bold">{stats.registeredPatients}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CSV Upload</p>
                    <p className="text-2xl font-bold">{stats.csvUploadPatients}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{stats.totalRecords}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by UPI, Patient ID, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedPatients.size > 0 && (
                    <Button
                      onClick={handleNotifyBulk}
                      disabled={notifying === 'bulk'}
                      variant="default"
                    >
                      {notifying === 'bulk' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Notify Selected ({selectedPatients.size})
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    variant="outline"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    variant="outline"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Patients</CardTitle>
                  <CardDescription>
                    {filteredPatients.length} of {patients.length} patients
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedPatients.size === filteredPatients.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No patients found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={selectedPatients.size === filteredPatients.length && filteredPatients.length > 0}
                            onChange={selectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">UPI</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Patient ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Records</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => (
                        <tr key={patient.upi} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedPatients.has(patient.upi)}
                              onChange={() => toggleSelectPatient(patient.upi)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono">{patient.upi}</code>
                              <button
                                onClick={() => copyUPI(patient.upi)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Copy UPI"
                              >
                                {copiedUPI === patient.upi ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{patient.hospitalPatientId}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-1">
                              {patient.email && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-xs">{patient.email}</span>
                                </div>
                              )}
                              {patient.phone && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span className="text-xs">{patient.phone}</span>
                                </div>
                              )}
                              {!patient.email && !patient.phone && (
                                <span className="text-xs text-muted-foreground">No contact info</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={patient.source === 'registered' ? 'default' : 'info'}
                            >
                              {patient.source === 'registered' ? 'Registered' : 'CSV Upload'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {(patient.encounterCount || 0) + (patient.conditionCount || 0) + (patient.observationCount || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNotify(patient.upi)}
                              disabled={notifying === patient.upi || (!patient.email && !patient.phone)}
                              title={!patient.email && !patient.phone ? 'No contact info available' : 'Send UPI notification'}
                            >
                              {notifying === patient.upi ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

