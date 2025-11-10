import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Database, Bell } from 'lucide-react';

export default function HospitalSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hospital Settings</h1>
          <p className="text-muted-foreground">
            Manage integration settings and API keys
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                FHIR Integration
              </CardTitle>
              <CardDescription>Configure FHIR R4 API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="fhir-base-url" className="block text-sm font-medium mb-2">
                  FHIR Base URL
                </label>
                <input
                  id="fhir-base-url"
                  type="url"
                  placeholder="https://fhir.example.com/fhir"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="fhir-api-key" className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <input
                  id="fhir-api-key"
                  type="password"
                  placeholder="Bearer token"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <Button>Save Configuration</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">MediPact API Key</p>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  mp_••••••••••••••••••••••••••••••••
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Hedera Account ID</p>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  0.0.123456
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Processing Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when data processing completes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Revenue Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when revenue is distributed
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="hospital-name" className="block text-sm font-medium mb-2">
                  Hospital Name
                </label>
                <input
                  id="hospital-name"
                  type="text"
                  placeholder="City General Hospital"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="hospital-address" className="block text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  id="hospital-address"
                  type="text"
                  placeholder="123 Medical Street"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

