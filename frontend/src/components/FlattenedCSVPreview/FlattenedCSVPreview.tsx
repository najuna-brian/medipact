'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileSpreadsheet } from 'lucide-react';
import { exportQueryAsFlattenedCSV, downloadDataset } from '@/lib/api/marketplace';
import { QueryFilters } from '@/lib/api/marketplace';

interface FlattenedCSVPreviewProps {
  csvData: string;
  recordCount: number;
  filters: QueryFilters;
  researcherId: string | null;
  onExport?: () => void;
}

export function FlattenedCSVPreview({ 
  csvData, 
  recordCount, 
  filters, 
  researcherId,
  onExport 
}: FlattenedCSVPreviewProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Parse CSV data
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = lines[0]?.split(',') || [];
  const rows = lines.slice(1).map(line => {
    // Simple CSV parsing (handles quoted values)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value
    return values;
  });

  const handleExport = async () => {
    if (!researcherId) {
      alert('Please log in to export data');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportQueryAsFlattenedCSV(filters, researcherId, filters.limit);
      const filename = `patient-data-${filters.conditionName || 'query'}-${Date.now()}.csv`;
      downloadDataset(blob, filename);
      if (onExport) onExport();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Show preview of first 10 rows
  const previewRows = rows.slice(0, 10);
  const hasMore = rows.length > 10;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Data Preview (Flattened CSV Format)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {recordCount.toLocaleString()} patient record{recordCount !== 1 ? 's' : ''} found
              {hasMore && ` (showing first 10 of ${rows.length})`}
            </p>
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !researcherId}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 text-sm text-gray-900 border-r whitespace-nowrap"
                        title={cell}
                      >
                        {cell.length > 50 ? `${cell.substring(0, 50)}...` : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {hasMore && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Eye className="h-4 w-4 inline mr-1" />
            Showing first 10 rows. Export to see all {rows.length} records.
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Format:</strong> One row per patient with all data denormalized. 
            Each patient record includes demographics, conditions, and lab results in a single row.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

