'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Dataset } from '@/lib/api/marketplace';
import { format } from 'date-fns';

interface DatasetCardProps {
  dataset: Dataset;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM yyyy');
    } catch {
      return date;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'HBAR') {
      return `${price.toFixed(2)} HBAR`;
    }
    return `${price.toFixed(2)} ${currency}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{dataset.name}</CardTitle>
            <CardDescription className="line-clamp-2">{dataset.description}</CardDescription>
          </div>
          <Badge
            variant={dataset.status === 'active' ? 'default' : 'default'}
            className="ml-2"
          >
            {dataset.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Records</p>
              <p className="font-semibold">{dataset.recordCount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-semibold">{formatPrice(dataset.price, dataset.currency)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="font-semibold">{dataset.country}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date Range</p>
              <p className="font-semibold text-xs">
                {formatDate(dataset.dateRangeStart)} - {formatDate(dataset.dateRangeEnd)}
              </p>
            </div>
          </div>
        </div>

        {dataset.conditionCodes && dataset.conditionCodes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Conditions</p>
            <div className="flex flex-wrap gap-1">
              {dataset.conditionCodes.slice(0, 3).map((code, idx) => (
                <Badge key={idx} variant="info" className="text-xs">
                  {code}
                </Badge>
              ))}
              {dataset.conditionCodes.length > 3 && (
                <Badge variant="info" className="text-xs">
                  +{dataset.conditionCodes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Format: <span className="font-medium">{dataset.format}</span>
          </div>
          <Link href={`/researcher/dataset/${dataset.id}`}>
            <Button size="sm" variant="default">
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

