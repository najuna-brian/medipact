'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Download } from 'lucide-react';
import type { AnonymizedRecord } from '@/types/adapter';

interface DataViewerProps {
  records: AnonymizedRecord[];
  title?: string;
  showDownload?: boolean;
}

export default function DataViewer({
  records,
  title = 'Anonymized Data',
  showDownload = true,
}: DataViewerProps) {
  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(records[0] || {});

  const handleDownload = () => {
    const csv = [
      headers.join(','),
      ...records.map((record) => headers.map((header) => record[header] || '').join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anonymized_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Safe anonymized data display (no PII)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Anonymized
            </Badge>
            {showDownload && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-accent transition"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {headers.map((header) => (
                  <th key={header} className="text-left p-2 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 100).map((record, idx) => (
                <tr key={idx} className="border-b hover:bg-accent/50">
                  {headers.map((header) => (
                    <td key={header} className="p-2">
                      {String(record[header] || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {records.length > 100 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing first 100 of {records.length.toLocaleString()} records
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

