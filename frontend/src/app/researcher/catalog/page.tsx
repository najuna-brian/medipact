'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Search, Filter, Loader2 } from 'lucide-react';
import { DatasetCard } from '@/components/DatasetCard/DatasetCard';
import { useDatasets } from '@/hooks/useDatasets';
import { useState } from 'react';

export default function ResearcherCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | undefined>();

  const { data, isLoading, error } = useDatasets({
    country: countryFilter,
  });

  // Filter datasets by search query
  const filteredDatasets = data?.datasets?.filter((dataset) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dataset.name.toLowerCase().includes(query) ||
      dataset.description.toLowerCase().includes(query) ||
      dataset.country.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Data Catalog</h1>
          <p className="text-muted-foreground">Browse anonymized medical datasets for research</p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4"
            />
          </div>
          <Button variant="outline" onClick={() => setCountryFilter(undefined)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading datasets...</span>
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600">Error loading datasets: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {filteredDatasets && filteredDatasets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDatasets.map((dataset) => (
                  <DatasetCard key={dataset.id} dataset={dataset} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No datasets match your search' : 'No datasets available'}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
