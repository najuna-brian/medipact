'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConsentForm from '@/components/ConsentForm/ConsentForm';
import { QrCode, FileText, Users } from 'lucide-react';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';

export default function HospitalConsentPage() {
  const consentRecords = [
    {
      id: '1',
      patientId: 'PAT-001',
      anonymousId: 'PID-001',
      date: new Date('2024-01-15'),
      status: 'valid',
    },
    {
      id: '2',
      patientId: 'PAT-002',
      anonymousId: 'PID-002',
      date: new Date('2024-01-14'),
      status: 'valid',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Consent Management</h1>
            <p className="text-muted-foreground">Manage patient consent forms and QR codes</p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>New Consent Form</CardTitle>
                <CardDescription>Create a new patient consent record</CardDescription>
              </CardHeader>
              <CardContent>
                <ConsentForm
                  onSubmit={(data) => {
                    console.log('Consent submitted:', data);
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code Generator</CardTitle>
                <CardDescription>Generate QR codes for in-person enrollment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                  <QrCode className="mx-auto mb-4 h-24 w-24 text-muted-foreground" />
                  <p className="mb-4 text-sm text-muted-foreground">
                    QR code will appear here after generating
                  </p>
                  <Button>Generate QR Code</Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Instructions:</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Click &quot;Generate QR Code&quot; to create a unique enrollment code</li>
                    <li>Patient scans QR code with mobile money app</li>
                    <li>Patient signs consent form or uses thumbprint</li>
                    <li>System automatically links anonymous ID to mobile money number</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Consent Records
              </CardTitle>
              <CardDescription>All patient consent records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <p className="font-semibold">{record.patientId}</p>
                        <Badge variant="info">{record.anonymousId}</Badge>
                        <Badge variant={record.status === 'valid' ? 'success' : 'error'}>
                          {record.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.date.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <QrCode className="mr-2 h-4 w-4" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

