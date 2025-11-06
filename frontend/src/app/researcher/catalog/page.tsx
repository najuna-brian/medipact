import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Search, Filter } from 'lucide-react';

export default function ResearcherCatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data Catalog</h1>
          <p className="text-muted-foreground">
            Browse anonymized medical datasets for research
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search datasets..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder dataset cards */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Dataset {i}</CardTitle>
                  <Badge variant="info">Available</Badge>
                </div>
                <CardDescription>
                  Medical records dataset for research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Records</p>
                  <p className="font-semibold">1,000+</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="font-semibold">10 HBAR</p>
                </div>
                <Button className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {[1, 2, 3, 4, 5, 6].length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No datasets available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

