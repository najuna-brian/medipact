'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Select component - using native select for now
import { Filter, X, Search } from 'lucide-react';
import { QueryFilters } from '@/lib/api/marketplace';

interface QueryBuilderProps {
  onQuery: (filters: QueryFilters) => void;
  onReset?: () => void;
  initialFilters?: QueryFilters;
}

export function QueryBuilder({ onQuery, onReset, initialFilters = {} }: QueryBuilderProps) {
  const [filters, setFilters] = useState<QueryFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof QueryFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuery(filters);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Query Builder
          </CardTitle>
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
          {/* Basic Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="e.g., Uganda"
                value={filters.country || ''}
                onChange={(e) => updateFilter('country', e.target.value)}
              />
            </div>

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
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <Label htmlFor="resourceType">Resource Type</Label>
              <select
                id="resourceType"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={filters.resourceType || ''}
                onChange={(e) => updateFilter('resourceType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Patient">Patient</option>
                <option value="Encounter">Encounter</option>
                <option value="Condition">Condition</option>
                <option value="Observation">Observation</option>
                <option value="MedicationRequest">Medication Request</option>
                <option value="Procedure">Procedure</option>
                <option value="ImagingStudy">Imaging Study</option>
                <option value="AllergyIntolerance">Allergy</option>
                <option value="Coverage">Coverage</option>
              </select>
            </div>
          </div>

          {/* Domain-Specific Filters */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
            </Button>

            {showAdvanced && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 border-t pt-4">
                {/* Domain 3: Conditions */}
                <div>
                  <Label htmlFor="conditionCode">Condition Code (ICD-10/SNOMED)</Label>
                  <Input
                    id="conditionCode"
                    placeholder="e.g., E11"
                    value={filters.conditionCode || ''}
                    onChange={(e) => updateFilter('conditionCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="conditionName">Condition Name</Label>
                  <Input
                    id="conditionName"
                    placeholder="e.g., Diabetes"
                    value={filters.conditionName || ''}
                    onChange={(e) => updateFilter('conditionName', e.target.value)}
                  />
                </div>

                {/* Domain 4: Observations */}
                <div>
                  <Label htmlFor="observationCode">Observation Code (LOINC)</Label>
                  <Input
                    id="observationCode"
                    placeholder="e.g., 4548-4"
                    value={filters.observationCode || ''}
                    onChange={(e) => updateFilter('observationCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="observationName">Observation Name</Label>
                  <Input
                    id="observationName"
                    placeholder="e.g., HbA1c"
                    value={filters.observationName || ''}
                    onChange={(e) => updateFilter('observationName', e.target.value)}
                  />
                </div>

                {/* Domain 2: Encounters */}
                <div>
                  <Label htmlFor="encounterType">Encounter Type</Label>
                  <Input
                    id="encounterType"
                    placeholder="e.g., consultation"
                    value={filters.encounterType || ''}
                    onChange={(e) => updateFilter('encounterType', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="encounterClass">Encounter Class</Label>
                  <select
                    id="encounterClass"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={filters.encounterClass || ''}
                    onChange={(e) => updateFilter('encounterClass', e.target.value)}
                  >
                    <option value="">All Classes</option>
                    <option value="AMB">Ambulatory</option>
                    <option value="IMP">Inpatient</option>
                    <option value="EMER">Emergency</option>
                    <option value="VR">Virtual</option>
                  </select>
                </div>

                {/* Domain 5: Medications */}
                <div>
                  <Label htmlFor="medicationCode">Medication Code (RxNorm/ATC)</Label>
                  <Input
                    id="medicationCode"
                    placeholder="e.g., 6809-2058"
                    value={filters.medicationCode || ''}
                    onChange={(e) => updateFilter('medicationCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="medicationName">Medication Name</Label>
                  <Input
                    id="medicationName"
                    placeholder="e.g., Metformin"
                    value={filters.medicationName || ''}
                    onChange={(e) => updateFilter('medicationName', e.target.value)}
                  />
                </div>

                {/* Domain 6: Procedures */}
                <div>
                  <Label htmlFor="procedureCode">Procedure Code (CPT/SNOMED)</Label>
                  <Input
                    id="procedureCode"
                    placeholder="e.g., 99213"
                    value={filters.procedureCode || ''}
                    onChange={(e) => updateFilter('procedureCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="procedureName">Procedure Name</Label>
                  <Input
                    id="procedureName"
                    placeholder="e.g., Office Visit"
                    value={filters.procedureName || ''}
                    onChange={(e) => updateFilter('procedureName', e.target.value)}
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
            <Button type="submit" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Execute Query
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

