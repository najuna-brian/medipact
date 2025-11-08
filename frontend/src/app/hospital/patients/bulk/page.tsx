'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  FileText,
  Download,
  Users,
} from 'lucide-react';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useBulkRegisterPatients } from '@/hooks/usePatientIdentity';
import { useRouter } from 'next/navigation';

export default function HospitalBulkUploadPage() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated } = useHospitalSession();
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const bulkMutation = useBulkRegisterPatients();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/hospital/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Determine format from file extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') {
      setFormat('json');
    } else {
      setFormat('csv');
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId || !apiKey || !fileContent) {
      setError('Please select a file to upload');
      return;
    }

    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      let data: string | any[];
      if (format === 'json') {
        try {
          data = JSON.parse(fileContent);
        } catch (e) {
          setError('Invalid JSON format. Please check your file.');
          return;
        }
      } else {
        data = fileContent;
      }

      const response = await bulkMutation.mutateAsync({
        hospitalId,
        apiKey,
        request: {
          format,
          data,
        },
      });

      setResult(response.result);
      setSuccess(
        `Bulk registration completed! ${response.result.successful} successful, ${response.result.failed} failed.`
      );
      setFile(null);
      setFileContent('');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to process bulk registration');
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `name,dateOfBirth,phone,email,nationalId,patientId
John Doe,1990-01-01,+256700123456,john@example.com,ID123456,PAT-001
Jane Smith,1985-05-15,+256700234567,jane@example.com,ID234567,PAT-002`;

    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Bulk Patient Registration</h1>
          <p className="text-muted-foreground">
            Upload a CSV or JSON file to register multiple patients at once
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 flex-1">{error}</span>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-800 flex-1">{success}</span>
            <button onClick={() => setSuccess(null)}>
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>Select a CSV or JSON file with patient data</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">File Format</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={format === 'csv' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat('csv')}
                    >
                      CSV
                    </Button>
                    <Button
                      type="button"
                      variant={format === 'json' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormat('json')}
                    >
                      JSON
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {file ? file.name : 'Select a file to upload'}
                  </p>
                  <input
                    type="file"
                    accept={format === 'csv' ? '.csv' : '.json'}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <span className="cursor-pointer">
                      <Button type="button" variant="outline">
                        Choose File
                      </Button>
                    </span>
                  </label>
                </div>

                {file && (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Badge variant="info">{(file.size / 1024).toFixed(2)} KB</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Format: {format.toUpperCase()}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!file || bulkMutation.isPending}
                >
                  {bulkMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Process Registration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Format Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">CSV Format</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Required columns: name, dateOfBirth, patientId
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Optional columns: phone, email, nationalId
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="mt-2"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">JSON Format</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Array of patient objects with fields: name, dateOfBirth, patientId, phone,
                    email, nationalId
                  </p>
                </div>
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Registration Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Records</span>
                      <span className="font-semibold">{result.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Successful</span>
                      <Badge variant="success">{result.successful}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Failed</span>
                      <Badge variant="error">{result.failed}</Badge>
                    </div>

                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-sm font-semibold mb-2">Errors:</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {result.errors.slice(0, 10).map((err: any, idx: number) => (
                            <div key={idx} className="text-xs text-red-600 p-2 bg-red-50 rounded">
                              Row {err.row}: {err.errors.join(', ')}
                            </div>
                          ))}
                          {result.errors.length > 10 && (
                            <p className="text-xs text-muted-foreground">
                              ... and {result.errors.length - 10} more errors
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

