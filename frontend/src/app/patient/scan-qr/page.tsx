'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, QrCode, Camera, X } from 'lucide-react';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useLinkHospital } from '@/hooks/usePatientIdentity';
import { useRouter } from 'next/navigation';
import { PatientProtectedRoute } from '@/components/PatientProtectedRoute/PatientProtectedRoute';
import { PatientSidebar } from '@/components/Sidebar/PatientSidebar';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function PatientScanQRContent() {
  const router = useRouter();
  const { upi } = usePatientSession();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [hospitalPatientId, setHospitalPatientId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const linkHospitalMutation = useLinkHospital();

  // Simple QR code scanner using camera and manual input
  const handleManualInput = () => {
    const token = prompt('Enter the QR code token (or scan with your camera app):');
    if (token) {
      processQRToken(token);
    }
  };

  const processQRToken = async (token: string) => {
    try {
      // Decode base64 token (browser-compatible)
      const decoded = atob(token);
      const tokenData = JSON.parse(decoded);
      
      // Verify token hasn't expired
      if (Date.now() > tokenData.expiresAt) {
        setError('QR code has expired. Please ask the hospital for a new one.');
        return;
      }
      
      // Extract hospital ID
      setHospitalId(tokenData.hospitalId);
      setScannedToken(token);
      setError(null);
      setSuccess('QR code scanned successfully! Please enter your hospital patient ID.');
    } catch (err: any) {
      setError('Invalid QR code. Please try again or enter the token manually.');
    }
  };

  const handleLinkHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upi || !hospitalId || !scannedToken || !hospitalPatientId.trim()) {
      setError('Please enter your hospital patient ID');
      return;
    }

    setIsLinking(true);
    setError(null);
    setSuccess(null);

    try {
      // Verify token and get hospital API key (we'll need to get this from the hospital)
      // For now, we'll use the token to verify the hospital
      // In production, the hospital would provide their API key through a secure channel
      
      // First, verify the token with the hospital
      const verifyResponse = await axios.get(
        `${API_BASE_URL}/api/hospital/${hospitalId}/verify-token`,
        {
          params: { token: scannedToken }
        }
      );

      if (!verifyResponse.data.valid) {
        throw new Error('Invalid or expired token');
      }

      // Link hospital using verified token
      // The backend will use the token to securely link without exposing API key
      await linkHospitalMutation.mutateAsync({
        upi,
        hospitalId,
        hospitalPatientId: hospitalPatientId.trim(),
        apiKey: verifyResponse.data.apiKey || '', // API key from verified token
        verificationMethod: 'qr_code_scan'
      });

      setSuccess('Hospital linked successfully!');
      setTimeout(() => {
        router.push('/patient/connect');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to link hospital');
    } finally {
      setIsLinking(false);
    }
  };

  const handleReset = () => {
    setScannedToken(null);
    setHospitalId(null);
    setHospitalPatientId('');
    setError(null);
    setSuccess(null);
  };

  return (
    <PatientProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <PatientSidebar />
        <div className="ml-0 md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold">Scan Hospital QR Code</h1>
              <p className="text-muted-foreground">
                Scan a QR code from your hospital to quickly link your account
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-800">{success}</span>
              </div>
            )}

            {!scannedToken ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Scan QR Code
                  </CardTitle>
                  <CardDescription>
                    Use your phone's camera to scan the hospital's QR code, or enter the token manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-md rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                      <QrCode className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Point your camera at the hospital's QR code
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Or use your phone's built-in QR scanner and paste the token below
                      </p>
                    </div>
                    <Button onClick={handleManualInput} variant="outline" className="w-full max-w-md">
                      <Camera className="mr-2 h-4 w-4" />
                      Enter Token Manually
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    QR Code Scanned
                  </CardTitle>
                  <CardDescription>
                    Hospital ID: {hospitalId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLinkHospital} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Your Hospital Patient ID
                      </label>
                      <input
                        type="text"
                        value={hospitalPatientId}
                        onChange={(e) => setHospitalPatientId(e.target.value)}
                        placeholder="Enter your patient ID at this hospital"
                        className="w-full rounded-lg border px-3 py-2"
                        required
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        This is the ID the hospital uses to identify you in their system
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLinking}
                      >
                        {isLinking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Linking...
                          </>
                        ) : (
                          <>
                            Link Hospital
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={isLinking}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PatientProtectedRoute>
  );
}

export default function PatientScanQRPage() {
  return <PatientScanQRContent />;
}

