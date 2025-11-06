import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Link2, CheckCircle2, Plus } from 'lucide-react';

export default function PatientConnectPage() {
  const connectedHospitals = [
    {
      id: '1',
      name: 'City General Hospital',
      fhirEndpoint: 'https://fhir.cityhospital.com/fhir',
      status: 'connected',
      lastSync: new Date('2024-01-20'),
      records: 125,
    },
    {
      id: '2',
      name: 'Regional Medical Center',
      fhirEndpoint: 'https://fhir.regionalmed.com/fhir',
      status: 'connected',
      lastSync: new Date('2024-01-19'),
      records: 89,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connect Hospitals</h1>
          <p className="text-muted-foreground">
            Connect your hospital portals to sync medical records
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Connect New Hospital
              </CardTitle>
              <CardDescription>Add a new hospital portal connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="hospital-name" className="block text-sm font-medium mb-2">
                  Hospital Name
                </label>
                <input
                  id="hospital-name"
                  type="text"
                  placeholder="Enter hospital name"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="fhir-url" className="block text-sm font-medium mb-2">
                  FHIR API Endpoint
                </label>
                <input
                  id="fhir-url"
                  type="url"
                  placeholder="https://fhir.example.com/fhir"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="api-token" className="block text-sm font-medium mb-2">
                  API Token (optional)
                </label>
                <input
                  id="api-token"
                  type="password"
                  placeholder="Bearer token"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <Button className="w-full">
                <Link2 className="w-4 h-4 mr-2" />
                Connect Hospital
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Automatic Sync</p>
                  <p className="text-sm text-muted-foreground">
                    Your medical records sync automatically
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Complete History</p>
                  <p className="text-sm text-muted-foreground">
                    Access your full medical history in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Secure & Private</p>
                  <p className="text-sm text-muted-foreground">
                    All connections use secure FHIR R4 standards
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Connected Hospitals
            </CardTitle>
            <CardDescription>Hospitals with access to your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{hospital.name}</h3>
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {hospital.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{hospital.fhirEndpoint}</span>
                      <span>•</span>
                      <span>{hospital.records} records</span>
                      <span>•</span>
                      <span>Last sync: {hospital.lastSync.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm">
                      Disconnect
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

