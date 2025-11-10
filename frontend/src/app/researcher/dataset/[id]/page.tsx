import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, DollarSign, FileText, Calendar, Users, Shield } from 'lucide-react';
import HashScanLink from '@/components/HashScanLink/HashScanLink';

interface DatasetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { id } = await params;
  // Mock dataset data - in production, fetch from API
  const dataset = {
    id: id,
    title: 'Diabetes Research Dataset',
    description:
      'Comprehensive anonymized dataset containing diabetes patient records, lab results, and treatment outcomes.',
    category: 'Diabetes',
    records: 5000,
    price: 50,
    currency: 'HBAR',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    quality: 95,
    diseaseTypes: ['Type 2 Diabetes', 'Pre-diabetes'],
    demographics: {
      ageRange: '18-75',
      gender: 'All',
      regions: ['Global'],
    },
    consentTopicId: '0.0.123456',
    dataTopicId: '0.0.123457',
    hashScanLinks: {
      consent: '0.0.123456@1234567890.123456789',
      data: '0.0.123457@1234567890.123456790',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{dataset.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="info">{dataset.category}</Badge>
                <Badge variant="success" className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{dataset.price} {dataset.currency}</p>
              <p className="text-sm text-muted-foreground">One-time purchase</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{dataset.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dataset Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Records</p>
                      <p className="font-semibold">{dataset.records.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data Quality</p>
                      <p className="font-semibold">{dataset.quality}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-semibold">{dataset.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Demographics</p>
                      <p className="font-semibold">{dataset.demographics.ageRange}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disease Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dataset.diseaseTypes.map((type) => (
                    <Badge key={type} variant="info">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
                <CardDescription>Hedera blockchain verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Consent Topic</p>
                  <HashScanLink
                    transactionId={dataset.hashScanLinks.consent}
                    variant="button"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Data Topic</p>
                  <HashScanLink
                    transactionId={dataset.hashScanLinks.data}
                    variant="button"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-2xl font-bold">
                    {dataset.price} {dataset.currency}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ≈ ${(dataset.price * 0.05).toFixed(2)} USD
                  </p>
                </div>
                <Button className="w-full" size="lg">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Purchase Dataset
                </Button>
                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <p>✓ Instant download after purchase</p>
                  <p>✓ Full dataset access</p>
                  <p>✓ Anonymized and verified</p>
                  <p>✓ Research license included</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• CSV format dataset</p>
                <p>• FHIR Bundle format (if available)</p>
                <p>• Dataset metadata</p>
                <p>• Verification proofs</p>
                <p>• Research license</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

