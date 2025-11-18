'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X, Search, Users, Calendar, MapPin } from 'lucide-react';
import { QueryFilters, getFilterOptions, FilterOptions } from '@/lib/api/marketplace';

interface QueryBuilderProps {
  onQuery: (filters: QueryFilters) => void;
  onReset?: () => void;
  initialFilters?: QueryFilters;
}

export function QueryBuilder({ onQuery, onReset, initialFilters = {} }: QueryBuilderProps) {
  const [filters, setFilters] = useState<QueryFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    // Load filter options (countries, conditions, etc.)
    setLoadingOptions(true);
    getFilterOptions()
      .then(setFilterOptions)
      .catch(console.error)
      .finally(() => setLoadingOptions(false));
  }, []);

  const updateFilter = (key: keyof QueryFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Always include preview mode for flattened CSV
    onQuery({ ...filters, preview: true });
  };

  const handleReset = () => {
    setFilters({});
    if (onReset) {
      onReset();
    }
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof QueryFilters] !== undefined && filters[key as keyof QueryFilters] !== ''
  );

  // Common conditions for quick selection
  const commonConditions = [
    { code: 'E11', name: 'Type 2 Diabetes Mellitus' },
    { code: 'I10', name: 'Essential Hypertension' },
    { code: 'E78', name: 'Disorders of Lipoprotein Metabolism' },
    { code: 'K21', name: 'Gastro-esophageal Reflux Disease' },
    { code: 'J44', name: 'Chronic Obstructive Pulmonary Disease' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Patient Data
            </CardTitle>
            <CardDescription className="mt-1">
              Search for patients by disease, country, and other criteria. All fields are optional.
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Search Fields - Most Important */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm text-blue-900 mb-3">Primary Search Criteria</h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Disease/Condition - Most Important */}
              <div className="md:col-span-2">
                <Label htmlFor="conditionName" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Disease / Condition <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <div className="space-y-2">
                  <Input
                    id="conditionName"
                    placeholder="Search or type disease name (e.g., Diabetes, Hypertension)"
                    value={filters.conditionName || ''}
                    onChange={(e) => updateFilter('conditionName', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex flex-wrap gap-2">
                    {commonConditions.map((cond) => (
                      <Button
                        key={cond.code}
                        type="button"
                        variant={filters.conditionName === cond.name ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          updateFilter('conditionName', cond.name);
                          updateFilter('conditionCode', cond.code);
                        }}
                        className="text-xs"
                      >
                        {cond.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Country <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <select
                  id="country"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={filters.country || ''}
                  onChange={(e) => updateFilter('country', e.target.value)}
                >
                  <option value="">All Countries</option>
                  {filterOptions?.countries?.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                  {!filterOptions && (
                    <>
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Rwanda">Rwanda</option>
                    </>
                  )}
                </select>
              </div>

              {/* Number of Patients */}
              <div>
                <Label htmlFor="limit" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Patients <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g., 100"
                  value={filters.limit || ''}
                  onChange={(e) => updateFilter('limit', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to get all matching patients
                </p>
              </div>
            </div>
          </div>

          {/* Date Range - Optional */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Additional Optional Filters */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Additional Filters
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 border-t pt-4">
                <div>
                  <Label htmlFor="ageRange">Age Range</Label>
                  <Input
                    id="ageRange"
                    placeholder="e.g., 35-39"
                    value={filters.ageRange || ''}
                    onChange={(e) => updateFilter('ageRange', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={filters.gender || ''}
                    onChange={(e) => updateFilter('gender', e.target.value)}
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="conditionCode">Condition Code (ICD-10)</Label>
                  <Input
                    id="conditionCode"
                    placeholder="e.g., E11"
                    value={filters.conditionCode || ''}
                    onChange={(e) => updateFilter('conditionCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="observationCode">Lab Test Code (LOINC)</Label>
                  <Input
                    id="observationCode"
                    placeholder="e.g., 4548-4"
                    value={filters.observationCode || ''}
                    onChange={(e) => updateFilter('observationCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="observationName">Lab Test Name</Label>
                  <Input
                    id="observationName"
                    placeholder="e.g., HbA1c"
                    value={filters.observationName || ''}
                    onChange={(e) => updateFilter('observationName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="hospitalId">Hospital ID</Label>
                  <Input
                    id="hospitalId"
                    placeholder="Hospital identifier"
                    value={filters.hospitalId || ''}
                    onChange={(e) => updateFilter('hospitalId', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" className="flex-1" size="lg">
              <Search className="h-4 w-4 mr-2" />
              Preview Data
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
