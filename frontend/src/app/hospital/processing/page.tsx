import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function HospitalProcessingPage() {
  // Mock processing history
  const processingHistory = [
    {
      id: '1',
      fileName: 'patient_data_2024_01.csv',
      recordsProcessed: 250,
      status: 'completed',
      processedAt: new Date('2024-01-20'),
      consentProofs: 50,
      dataProofs: 250,
    },
    {
      id: '2',
      fileName: 'lab_results_2024_01.csv',
      recordsProcessed: 180,
      status: 'completed',
      processedAt: new Date('2024-01-19'),
      consentProofs: 45,
      dataProofs: 180,
    },
    {
      id: '3',
      fileName: 'medical_records_2024_01.csv',
      recordsProcessed: 320,
      status: 'processing',
      processedAt: new Date('2024-01-21'),
      consentProofs: 0,
      dataProofs: 0,
    },
  ];

  // Mock anonymized data
  // const mockRecords: AnonymizedRecord[] = [
  //   {
  //     'Anonymous PID': 'PID-001',
  //     'Test Type': 'Blood Glucose',
  //     'Result': '95',
  //     'Unit': 'mg/dL',
  //     'Date': '2024-01-15',
  //   },
  //   {
  //     'Anonymous PID': 'PID-002',
  //     'Test Type': 'Cholesterol',
  //     'Result': '180',
  //     'Unit': 'mg/dL',
  //     'Date': '2024-01-15',
  //   },
  // ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Processing History</h1>
          <p className="text-muted-foreground">
            View processing logs and anonymized data results
          </p>
        </div>

        <div className="space-y-6">
          {processingHistory.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5" />
                      {item.fileName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {item.processedAt.toLocaleDateString()}
                      </span>
                      <span>{item.recordsProcessed} records</span>
                    </CardDescription>
                  </div>
                  <Badge
                    variant={item.status === 'completed' ? 'success' : 'warning'}
                    className="flex items-center gap-1"
                  >
                    {item.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Processing
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Records Processed</p>
                    <p className="text-xl font-bold">{item.recordsProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consent Proofs</p>
                    <p className="text-xl font-bold">{item.consentProofs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Proofs</p>
                    <p className="text-xl font-bold">{item.dataProofs}</p>
                  </div>
                </div>
                {item.status === 'completed' && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm">
                      View Anonymized Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {processingHistory.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No processing history yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

