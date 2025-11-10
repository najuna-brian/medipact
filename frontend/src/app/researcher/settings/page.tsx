import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, CreditCard, FileText } from 'lucide-react';

export default function ResearcherSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Researcher Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile and billing information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Dr. Jane Smith"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2">
                  Organization
                </label>
                <input
                  id="organization"
                  type="text"
                  placeholder="Medical Research Institute"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@research.org"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Payment Method</p>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">HBAR Wallet</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  0.0.123456
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Monthly Budget</p>
                  <Button variant="outline" size="sm">
                    Set Budget
                  </Button>
                </div>
                <p className="text-2xl font-bold">500 HBAR</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ $25.00 USD per month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Compliance & Ethics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-900 mb-1">IRB Approval</p>
                <p className="text-sm text-green-800">Status: Approved</p>
                <p className="text-xs text-green-700 mt-1">Expires: Dec 31, 2024</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900 mb-1">Data Use Agreement</p>
                <p className="text-sm text-blue-800">Signed and active</p>
                <Button variant="outline" size="sm" className="mt-2">
                  View Agreement
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export & Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Export Purchase History
              </Button>
              <Button variant="outline" className="w-full">
                Generate Usage Report
              </Button>
              <Button variant="outline" className="w-full">
                Download Compliance Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

