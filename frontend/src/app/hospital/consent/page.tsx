import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConsentForm from '@/components/ConsentForm/ConsentForm';
import { QrCode, FileText, Users } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Consent Management</h1>
          <p className="text-muted-foreground">
            Manage patient consent forms and QR codes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <QrCode className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  QR code will appear here after generating
                </p>
                <Button>Generate QR Code</Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Instructions:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click "Generate QR Code" to create a unique enrollment code</li>
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
              <Users className="w-5 h-5" />
              Consent Records
            </CardTitle>
            <CardDescription>All patient consent records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                      <FileText className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <QrCode className="w-4 h-4 mr-2" />
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
  );
}

