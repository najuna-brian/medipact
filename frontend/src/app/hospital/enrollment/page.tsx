import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Users, Smartphone, FileText } from 'lucide-react';
import ConsentForm from '@/components/ConsentForm/ConsentForm';

export default function HospitalEnrollmentPage() {
  const enrolledPatients = [
    {
      id: '1',
      patientId: 'PAT-001',
      anonymousId: 'PID-001',
      mobileMoney: '+256 700 123456',
      enrolledDate: new Date('2024-01-15'),
      status: 'active',
    },
    {
      id: '2',
      patientId: 'PAT-002',
      anonymousId: 'PID-002',
      mobileMoney: '+256 700 234567',
      enrolledDate: new Date('2024-01-14'),
      status: 'active',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Enrollment</h1>
          <p className="text-muted-foreground">
            Enroll patients using the in-person bridge method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code Enrollment
              </CardTitle>
              <CardDescription>In-person enrollment workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <QrCode className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Generate QR code for patient enrollment
                </p>
                <Button>Generate QR Code</Button>
              </div>

              <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900">Enrollment Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Hospital clerk explains the program to patient</li>
                  <li>Patient signs paper consent form or uses thumbprint</li>
                  <li>Clerk scans QR code to generate enrollment link</li>
                  <li>Patient's mobile money number is linked to anonymous ID</li>
                  <li>Patient is automatically enrolled in passive marketplace</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Manual Enrollment
              </CardTitle>
              <CardDescription>Enroll patient manually</CardDescription>
            </CardHeader>
            <CardContent>
              <ConsentForm
                onSubmit={(data) => {
                  console.log('Manual enrollment:', data);
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Enrolled Patients
            </CardTitle>
            <CardDescription>All patients enrolled in the program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{patient.patientId}</p>
                      <Badge variant="info">{patient.anonymousId}</Badge>
                      <Badge variant={patient.status === 'active' ? 'success' : 'error'}>
                        {patient.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {patient.mobileMoney}
                      </span>
                      <span>{patient.enrolledDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

