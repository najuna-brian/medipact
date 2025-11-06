'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Database } from 'lucide-react';
import { useProcessAdapter } from '@/hooks/useAdapter';
import ProcessingStatus from '@/components/ProcessingStatus/ProcessingStatus';

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Data</h1>
          <p className="text-muted-foreground">
            Upload CSV or connect to FHIR API to process patient data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file with patient data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
                  Select CSV File
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}
              <Button
                onClick={handleUpload}
                disabled={!file || processMutation.isPending}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload and Process
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connect FHIR API</CardTitle>
              <CardDescription>
                Connect to a FHIR R4 compliant API endpoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="fhir-url" className="block text-sm font-medium mb-2">
                  FHIR Base URL
                </label>
                <input
                  id="fhir-url"
                  type="url"
                  placeholder="https://fhir.example.com/fhir"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="fhir-token" className="block text-sm font-medium mb-2">
                  API Token (optional)
                </label>
                <input
                  id="fhir-token"
                  type="password"
                  placeholder="Bearer token"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <Button variant="outline" className="w-full">
                <Database className="w-4 h-4 mr-2" />
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
  );
}

