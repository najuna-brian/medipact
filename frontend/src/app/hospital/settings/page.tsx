'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Database, Bell, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';

export default function HospitalSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Hospital Settings</h1>
            <p className="text-muted-foreground">Manage integration settings and API keys</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  FHIR Integration
                </CardTitle>
                <CardDescription>Configure FHIR R4 API endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="fhir-base-url" className="mb-2 block text-sm font-medium">
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
                  <label htmlFor="fhir-api-key" className="mb-2 block text-sm font-medium">
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
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage your API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">MediPact API Key</p>
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                  <p className="font-mono text-sm text-muted-foreground">
                    mp_••••••••••••••••••••••••••••••••
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">Hedera Account ID</p>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                  <p className="font-mono text-sm text-muted-foreground">0.0.123456</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
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
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Revenue Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when revenue is distributed
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure payment method and withdrawal preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/hospital/settings/payment">
                  <Button variant="outline" className="w-full">
                    Manage Payment Method
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="hospital-name" className="mb-2 block text-sm font-medium">
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
                  <label htmlFor="hospital-address" className="mb-2 block text-sm font-medium">
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
    </div>
  );
}
