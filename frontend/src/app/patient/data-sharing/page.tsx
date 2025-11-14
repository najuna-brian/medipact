'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  History,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { usePatientSession } from '@/hooks/usePatientSession';
import { PatientProtectedRoute } from '@/components/PatientProtectedRoute/PatientProtectedRoute';
import { PatientSidebar } from '@/components/Sidebar/PatientSidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface PatientPreferences {
  upi: string;
  globalSharingEnabled: boolean;
  allowVerifiedResearchers: boolean;
  allowUnverifiedResearchers: boolean;
  allowBulkPurchases: boolean;
  allowSensitiveDataSharing: boolean;
  notifyOnDataAccess: boolean;
  notifyOnNewResearcher: boolean;
  minimumPricePerRecord: number;
  approvedResearcherIds: string[];
  blockedResearcherIds: string[];
}

interface ApprovalRequest {
  id: number;
  researcherId: string;
  organizationName: string;
  researcherEmail: string;
  verificationStatus: string;
  conditions: any;
  createdAt: string;
}

interface ApprovedResearcher {
  id: number;
  researcherId: string;
  organizationName: string;
  researcherEmail: string;
  approvedAt: string;
  conditions: any;
}

interface AccessHistory {
  id: number;
  researcherId: string;
  datasetId: string | null;
  recordCount: number;
  accessedAt: string;
  revenueAmount: number | null;
  revenueCurrency: string;
}

interface TemporaryAccessRequest {
  id: number;
  requestingHospitalId: string;
  requestingHospitalName: string;
  originalHospitalId: string;
  originalHospitalName: string;
  accessType: string;
  durationMinutes: number;
  durationFormatted: string;
  purpose: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
  timeRemainingMinutes?: number;
}

function DataSharingContent() {
  const { upi } = usePatientSession();
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [approvedResearchers, setApprovedResearchers] = useState<ApprovedResearcher[]>([]);
  const [accessHistory, setAccessHistory] = useState<AccessHistory[]>([]);
  const [tempAccessRequests, setTempAccessRequests] = useState<TemporaryAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (upi) {
      loadData();
    }
  }, [upi]);

  const loadData = async () => {
    if (!upi) return;
    
    setLoading(true);
    try {
      const [prefsRes, pendingRes, approvedRes, historyRes, tempAccessRes] = await Promise.all([
        fetch(`${API_URL}/api/patient/${upi}/preferences`),
        fetch(`${API_URL}/api/patient/${upi}/approvals/pending`),
        fetch(`${API_URL}/api/patient/${upi}/approvals/approved`),
        fetch(`${API_URL}/api/patient/${upi}/access-history`),
        fetch(`${API_URL}/api/patient/${upi}/temporary-access/pending`)
      ]);

      const prefs = await prefsRes.json();
      const pending = await pendingRes.json();
      const approved = await approvedRes.json();
      const history = await historyRes.json();
      const tempAccess = await tempAccessRes.json();

      setPreferences(prefs);
      setPendingRequests(pending.requests || []);
      setApprovedResearchers(approved.researchers || []);
      setAccessHistory(history.history || []);
      setTempAccessRequests(tempAccess.requests || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<PatientPreferences>) => {
    if (!upi || !preferences) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/patient/${upi}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const updated = await response.json();
      setPreferences(updated);
      setSuccess('Preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTempAccessApproval = async (requestId: number, action: 'approve' | 'reject' | 'revoke') => {
    if (!upi) return;

    setSaving(true);
    setError(null);

    try {
      const endpoint = action === 'approve'
        ? `${API_URL}/api/patient/${upi}/temporary-access/${requestId}/approve`
        : action === 'reject'
        ? `${API_URL}/api/patient/${upi}/temporary-access/${requestId}/reject`
        : `${API_URL}/api/patient/${upi}/temporary-access/${requestId}/revoke`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} temporary access`);
      }

      await loadData();
      setSuccess(`Temporary access ${action}d successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} temporary access`);
    } finally {
      setSaving(false);
    }
  };

  const handleApproval = async (researcherId: string, action: 'approve' | 'block' | 'reject') => {
    if (!upi) return;

    setSaving(true);
    setError(null);

    try {
      const endpoint = action === 'approve' 
        ? `${API_URL}/api/patient/${upi}/approvals/${researcherId}/approve`
        : action === 'block'
        ? `${API_URL}/api/patient/${upi}/approvals/${researcherId}/block`
        : `${API_URL}/api/patient/${upi}/approvals/${researcherId}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} researcher`);
      }

      await loadData();
      setSuccess(`Researcher ${action}d successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} researcher`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load preferences</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Data Sharing Controls</h1>
            <p className="text-muted-foreground">
              Control who can access your health data and how it's shared
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="preferences" className="space-y-6">
            <TabsList>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="requests">
                Researcher Requests ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="hospital-requests">
                Hospital Access ({tempAccessRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="history">Access History</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Global Settings</CardTitle>
                  <CardDescription>
                    Control overall data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="global-sharing">Enable Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow your data to be shared with researchers
                      </p>
                    </div>
                    <Switch
                      id="global-sharing"
                      checked={preferences.globalSharingEnabled}
                      onCheckedChange={(checked) =>
                        updatePreferences({ globalSharingEnabled: checked })
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="verified">Allow Verified Researchers</Label>
                      <p className="text-sm text-muted-foreground">
                        Researchers with verified credentials
                      </p>
                    </div>
                    <Switch
                      id="verified"
                      checked={preferences.allowVerifiedResearchers}
                      onCheckedChange={(checked) =>
                        updatePreferences({ allowVerifiedResearchers: checked })
                      }
                      disabled={saving || !preferences.globalSharingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="unverified">Allow Unverified Researchers</Label>
                      <p className="text-sm text-muted-foreground">
                        Researchers without verified credentials (requires approval)
                      </p>
                    </div>
                    <Switch
                      id="unverified"
                      checked={preferences.allowUnverifiedResearchers}
                      onCheckedChange={(checked) =>
                        updatePreferences({ allowUnverifiedResearchers: checked })
                      }
                      disabled={saving || !preferences.globalSharingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="bulk">Allow Bulk Purchases</Label>
                      <p className="text-sm text-muted-foreground">
                        Large dataset purchases (1000+ records)
                      </p>
                    </div>
                    <Switch
                      id="bulk"
                      checked={preferences.allowBulkPurchases}
                      onCheckedChange={(checked) =>
                        updatePreferences({ allowBulkPurchases: checked })
                      }
                      disabled={saving || !preferences.globalSharingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sensitive">Allow Sensitive Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Share data for sensitive conditions (HIV, mental health, etc.)
                      </p>
                    </div>
                    <Switch
                      id="sensitive"
                      checked={preferences.allowSensitiveDataSharing}
                      onCheckedChange={(checked) =>
                        updatePreferences({ allowSensitiveDataSharing: checked })
                      }
                      disabled={saving || !preferences.globalSharingEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-price">Minimum Price Per Record (USD)</Label>
                    <Input
                      id="min-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={preferences.minimumPricePerRecord}
                      onChange={(e) =>
                        updatePreferences({ minimumPricePerRecord: parseFloat(e.target.value) })
                      }
                      disabled={saving || !preferences.globalSharingEnabled}
                    />
                    <p className="text-sm text-muted-foreground">
                      Set minimum price you're willing to accept per record
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-access">Notify on Data Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when researchers access your data
                      </p>
                    </div>
                    <Switch
                      id="notify-access"
                      checked={preferences.notifyOnDataAccess}
                      onCheckedChange={(checked) =>
                        updatePreferences({ notifyOnDataAccess: checked })
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notify-new">Notify on New Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when researchers request access
                      </p>
                    </div>
                    <Switch
                      id="notify-new"
                      checked={preferences.notifyOnNewResearcher}
                      onCheckedChange={(checked) =>
                        updatePreferences({ notifyOnNewResearcher: checked })
                      }
                      disabled={saving}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending approval requests
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{request.organizationName}</h3>
                            <Badge variant={request.verificationStatus === 'verified' ? 'default' : 'warning'}>
                              {request.verificationStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.researcherEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(request.researcherId, 'approve')}
                            disabled={saving}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(request.researcherId, 'reject')}
                            disabled={saving}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="hospital-requests" className="space-y-4">
              {tempAccessRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending hospital access requests
                  </CardContent>
                </Card>
              ) : (
                tempAccessRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{request.requestingHospitalName}</h3>
                              <Badge variant="info">Hospital Access</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Requesting access to data from: <strong>{request.originalHospitalName}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Purpose: {request.purpose}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Duration: {request.durationFormatted}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Type: {request.accessType === 'telemedicine' ? 'Telemedicine Consultation' : request.accessType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleTempAccessApproval(request.id, 'approve')}
                            disabled={saving}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTempAccessApproval(request.id, 'reject')}
                            disabled={saving}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedResearchers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No approved researchers
                  </CardContent>
                </Card>
              ) : (
                approvedResearchers.map((researcher) => (
                  <Card key={researcher.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{researcher.organizationName}</h3>
                            <Badge variant="default">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Approved
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{researcher.researcherEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            Approved {new Date(researcher.approvedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(researcher.researcherId, 'block')}
                          disabled={saving}
                        >
                          Block
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {accessHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No access history yet
                  </CardContent>
                </Card>
              ) : (
                accessHistory.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">Data Access</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.recordCount} records accessed
                          </p>
                          {entry.revenueAmount && (
                            <p className="text-sm font-medium text-green-600">
                              Revenue: ${(entry.revenueAmount * 0.16).toFixed(2)} USD
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.accessedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function DataSharingPage() {
  return (
    <PatientProtectedRoute>
      <DataSharingContent />
    </PatientProtectedRoute>
  );
}

