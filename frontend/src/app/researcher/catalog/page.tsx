'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Search, Filter, Loader2 } from 'lucide-react';
import { DatasetCard } from '@/components/DatasetCard/DatasetCard';
import { useDatasets, useQueryData } from '@/hooks/useDatasets';
import { QueryBuilder } from '@/components/QueryBuilder/QueryBuilder';
import { QueryFilters } from '@/lib/api/marketplace';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResearcherCatalogPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | undefined>();
  const [queryFilters, setQueryFilters] = useState<QueryFilters | null>(null);
  const [researcherId, setResearcherId] = useState<string | null>(null);

  useEffect(() => {
    // Get researcher ID from sessionStorage
    const id = sessionStorage.getItem('researcherId');
    setResearcherId(id);
  }, []);

  const { data, isLoading, error } = useDatasets({
    country: countryFilter,
  });

  const { data: queryResult, isLoading: queryLoading } = useQueryData(
    queryFilters || {},
    researcherId,
    !!queryFilters && !!researcherId
  );

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

        <div className="mb-6">
          <div className="relative mb-4 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4"
            />
          </div>

          <QueryBuilder
            onQuery={(filters) => {
              setQueryFilters(filters);
            }}
            onReset={() => {
              setQueryFilters(null);
            }}
          />
        </div>

        {queryResult && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Query Results</p>
                  <p className="text-2xl font-bold">{queryResult.count} records found</p>
                </div>
                <div className="flex items-center gap-2">
                  {queryResult.preview && <Badge variant="outline">Preview mode</Badge>}
                  <Button
                    variant="default"
                    onClick={() => {
                      const params = new URLSearchParams();
                      Object.entries(queryFilters || {}).forEach(([key, value]) => {
                        if (value) params.set(key, String(value));
                      });
                      router.push(`/researcher/query?${params.toString()}`);
                    }}
                  >
                    View Full Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
