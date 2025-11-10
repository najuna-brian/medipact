'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Upload, Loader2, AlertCircle, Building2 } from 'lucide-react';
import {
  usePatientHistory,
  usePatientSummary,
  usePatientHospitals,
} from '@/hooks/usePatientIdentity';
import { usePatientSession } from '@/hooks/usePatientSession';
import { PatientProtectedRoute } from '@/components/PatientProtectedRoute/PatientProtectedRoute';

function PatientWalletContent() {
  const { upi } = usePatientSession();

  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = usePatientHistory(upi);
  const { data: summaryData, isLoading: summaryLoading } = usePatientSummary(upi);
  const { data: hospitalsData } = usePatientHospitals(upi);

  const connectedHospitals = hospitalsData?.hospitals || [];
  const history = historyData;
  const summary = summaryData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Health Wallet</h1>
          <p className="text-muted-foreground">
            Your complete medical history and records from all connected hospitals
          </p>
        </div>

        {upi && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Medical Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Timeline</CardTitle>
                  <CardDescription>
                    Chronological view of your medical records from all hospitals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : historyError ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800">
                        Error loading history: {historyError.message}
                      </span>
                    </div>
                  ) : history && history.totalRecords > 0 ? (
                    <div className="space-y-4">
                      {history.hospitals.map((hospital) => (
                        <div key={hospital.hospitalId} className="rounded-lg border p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold">{hospital.hospitalName}</h4>
                            <span className="text-sm text-muted-foreground">
                              ({hospital.recordCount} records)
                            </span>
                          </div>
                          {hospital.records.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {hospital.records.slice(0, 5).map((record: any, idx: number) => (
                                <div key={idx} className="pl-6 text-sm text-muted-foreground">
                                  {record['Lab Test'] || record['Test Type'] || 'Medical Record'} -{' '}
                                  {record['Test Date'] || 'No date'}
                                </div>
                              ))}
                              {hospital.records.length > 5 && (
                                <p className="pl-6 text-sm text-muted-foreground">
                                  +{hospital.records.length - 5} more records
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="pl-6 text-sm text-muted-foreground">
                              No records available yet
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 rounded-lg border p-4">
                      <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-semibold">No records yet</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect hospitals to see your medical timeline. Records will appear here
                          once hospitals sync your data.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connected Hospitals */}
              <Card>
                <CardHeader>
                  <CardTitle>Connected Hospitals</CardTitle>
                  <CardDescription>Hospitals with access to your data</CardDescription>
                </CardHeader>
                <CardContent>
                  {connectedHospitals.length === 0 ? (
                    <div>
                      <p className="mb-4 text-sm text-muted-foreground">No hospitals connected</p>
                      <Button
                        variant="outline"
                        onClick={() => (window.location.href = '/patient/connect')}
                      >
                        Connect Hospital
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {connectedHospitals.map((hospital) => (
                        <div
                          key={hospital.hospitalId}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <h4 className="font-semibold">
                              {hospital.hospitalName || hospital.hospitalId}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Linked: {new Date(hospital.linkedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = '/patient/connect')}
                          >
                            Manage
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = '/patient/upload')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Records
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => (window.location.href = '/patient/connect')}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Connect Hospital
                  </Button>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {summaryLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : summary ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Records</span>
                        <span className="font-semibold">{summary.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hospitals</span>
                        <span className="font-semibold">{summary.hospitalCount}</span>
                      </div>
                      {summary.dateRange && (
                        <div className="border-t pt-2">
                          <p className="mb-1 text-xs text-muted-foreground">Date Range</p>
                          <p className="text-sm">
                            {new Date(summary.dateRange.start).toLocaleDateString()} -{' '}
                            {new Date(summary.dateRange.end).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Records</span>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hospitals</span>
                        <span className="font-semibold">0</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientWalletPage() {
  return (
    <PatientProtectedRoute>
      <PatientWalletContent />
    </PatientProtectedRoute>
  );
}
