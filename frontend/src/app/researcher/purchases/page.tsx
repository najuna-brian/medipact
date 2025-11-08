import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, DollarSign } from 'lucide-react';

export default function ResearcherPurchasesPage() {
  const purchases = [
    {
      id: '1',
      datasetName: 'Diabetes Research Dataset',
      purchaseDate: new Date('2024-01-15'),
      price: 50,
      currency: 'HBAR',
      status: 'completed',
      downloadAvailable: true,
    },
    {
      id: '2',
      datasetName: 'Cardiovascular Health Dataset',
      purchaseDate: new Date('2024-01-10'),
      price: 75,
      currency: 'HBAR',
      status: 'completed',
      downloadAvailable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground">View and download your purchased datasets</p>
        </div>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{purchase.datasetName}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {purchase.purchaseDate.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {purchase.price} {purchase.currency}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={purchase.status === 'completed' ? 'success' : 'default'}>
                    {purchase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Dataset files available</span>
                  </div>
                  {purchase.downloadAvailable && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {purchases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">No purchases yet</p>
              <Button as="a" href="/researcher/catalog">
                Browse Catalog
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

