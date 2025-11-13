import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, DollarSign, Users, Database } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Platform-wide analytics and overview
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 md:gap-6 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl">0</div>
              <p className="text-xs text-muted-foreground">Processed records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl">0 HBAR</div>
              <p className="text-xs text-muted-foreground">Platform revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl">0</div>
              <p className="text-xs text-muted-foreground">Patients, hospitals, researchers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl">0</div>
              <p className="text-xs text-muted-foreground">HCS transactions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/admin/processing"
                className="block rounded-lg border p-3 text-sm transition hover:bg-accent"
              >
                Process Data
              </a>
              <a
                href="/admin/transactions"
                className="block rounded-lg border p-3 text-sm transition hover:bg-accent"
              >
                View Transactions
              </a>
              <a
                href="/admin/revenue"
                className="block rounded-lg border p-3 text-sm transition hover:bg-accent"
              >
                Revenue Analytics
              </a>
              <a
                href="/admin/hospitals"
                className="block rounded-lg border p-3 text-sm transition hover:bg-accent"
              >
                Hospital Verifications
              </a>
              <a
                href="/admin/researchers"
                className="block rounded-lg border p-3 text-sm transition hover:bg-accent"
              >
                Researcher Verifications
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

