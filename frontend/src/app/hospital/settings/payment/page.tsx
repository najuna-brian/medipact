'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Save
} from 'lucide-react';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';
import { getHospitalBalance } from '@/lib/api/wallet';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

function PaymentSettingsContent() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated, isLoading } = useHospitalSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    paymentMethod: '' as 'bank' | 'mobile_money' | '',
    bankName: '',
    bankAccountNumber: '',
    mobileMoneyProvider: '' as 'mtn' | 'airtel' | 'vodafone' | 'tigo' | '',
    mobileMoneyNumber: '',
    withdrawalThresholdUSD: 100.00,
    autoWithdrawEnabled: true,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/hospital/login');
    } else if (hospitalId) {
      loadPaymentSettings();
    }
  }, [hospitalId, isAuthenticated, isLoading, router]);

  const loadPaymentSettings = async () => {
    try {
      const balance = await getHospitalBalance(hospitalId!);
      setFormData({
        paymentMethod: (balance.paymentMethod as any) || '',
        bankName: balance.bankName || '',
        bankAccountNumber: balance.bankAccountNumber || '',
        mobileMoneyProvider: (balance.mobileMoneyProvider as any) || '',
        mobileMoneyNumber: balance.mobileMoneyNumber || '',
        withdrawalThresholdUSD: balance.withdrawalThresholdUSD || 100.00,
        autoWithdrawEnabled: balance.autoWithdrawEnabled !== false,
      });
    } catch (error) {
      console.error('Error loading payment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/hospital/${hospitalId}/payment-method`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Hospital-ID': hospitalId!,
          'X-API-Key': apiKey!
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update payment method');
      }

      setSuccess('Payment method updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update payment method');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HospitalSidebar />
        <div className="ml-0 md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Payment Settings</h1>
            <p className="text-muted-foreground">
              Configure how you want to receive revenue payments
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive your revenue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">Select payment method</option>
                    <option value="bank">Bank Account</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                {formData.paymentMethod === 'bank' && (
                  <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-semibold">Bank Account Details</Label>
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Bank of Uganda"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccountNumber">Account Number</Label>
                      <Input
                        id="bankAccountNumber"
                        type="text"
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        placeholder="1234567890"
                        className="mt-2"
                        required
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'mobile_money' && (
                  <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-semibold">Mobile Money Details</Label>
                    </div>
                    <div>
                      <Label htmlFor="mobileMoneyProvider">Provider</Label>
                      <select
                        id="mobileMoneyProvider"
                        value={formData.mobileMoneyProvider}
                        onChange={(e) => setFormData({ ...formData, mobileMoneyProvider: e.target.value as any })}
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        required
                      >
                        <option value="">Select provider</option>
                        <option value="mtn">MTN</option>
                        <option value="airtel">Airtel</option>
                        <option value="vodafone">Vodafone</option>
                        <option value="tigo">Tigo</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="mobileMoneyNumber">Phone Number</Label>
                      <Input
                        id="mobileMoneyNumber"
                        type="tel"
                        value={formData.mobileMoneyNumber}
                        onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                        placeholder="+256 700 123456"
                        className="mt-2"
                        required
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod && (
                  <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div>
                      <Label htmlFor="withdrawalThreshold">Auto-Withdraw Threshold (USD)</Label>
                      <Input
                        id="withdrawalThreshold"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.withdrawalThresholdUSD}
                        onChange={(e) => setFormData({ ...formData, withdrawalThresholdUSD: parseFloat(e.target.value) || 100.00 })}
                        className="mt-2"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Funds will automatically transfer when your balance reaches this amount
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoWithdraw"
                        checked={formData.autoWithdrawEnabled}
                        onChange={(e) => setFormData({ ...formData, autoWithdrawEnabled: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="autoWithdraw" className="cursor-pointer">
                        Enable automatic withdrawals
                      </Label>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving || !formData.paymentMethod}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Payment Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function HospitalPaymentSettingsPage() {
  return <PaymentSettingsContent />;
}

