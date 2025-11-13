'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Database } from 'lucide-react';
import { useProcessAdapter } from '@/hooks/useAdapter';
import ProcessingStatus from '@/components/ProcessingStatus/ProcessingStatus';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';

export default function HospitalUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const processMutation = useProcessAdapter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    processMutation.mutate(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Upload Data</h1>
            <p className="text-muted-foreground">
              Upload CSV or connect to FHIR API to process patient data
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>Upload a CSV file with patient data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="csv-upload" className="mb-2 block text-sm font-medium">
                    Select CSV File
                  </label>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
                <Button
                  onClick={handleUpload}
                  disabled={!file || processMutation.isPending}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Process
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connect FHIR API</CardTitle>
                <CardDescription>Connect to a FHIR R4 compliant API endpoint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="fhir-url" className="mb-2 block text-sm font-medium">
                    FHIR Base URL
                  </label>
                  <input
                    id="fhir-url"
                    type="url"
                    placeholder="https://fhir.example.com/fhir"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="fhir-token" className="mb-2 block text-sm font-medium">
                    API Token (optional)
                  </label>
                  <input
                    id="fhir-token"
                    type="password"
                    placeholder="Bearer token"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
                <Button variant="outline" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Connect FHIR API
                </Button>
              </CardContent>
            </Card>
          </div>

          {processMutation.isPending && (
            <Card className="mt-6">
              <CardContent className="py-8">
                <ProcessingStatus
                  status={{
                    status: 'processing',
                    progress: 50,
                    message: 'Processing uploaded data...',
                  }}
                />
              </CardContent>
            </Card>
          )}

          {processMutation.isSuccess && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upload Successful</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Data processed successfully. View results in processing history.
                </p>
              </CardContent>
            </Card>
          )}

          {processMutation.isError && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upload Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600">
                  {processMutation.error?.message || 'An error occurred during upload'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

