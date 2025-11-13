'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Users, DollarSign } from 'lucide-react';
import { PatientProtectedRoute } from '@/components/PatientProtectedRoute/PatientProtectedRoute';
import { PatientSidebar } from '@/components/Sidebar/PatientSidebar';

function PatientStudiesContent() {
  const studies = [
    {
      id: '1',
      title: 'Diabetes Research Study',
      organization: 'Medical Research Institute',
      description: 'Research on diabetes management and treatment outcomes',
      compensation: 50,
      duration: '6 months',
      participants: 150,
      status: 'open',
      category: 'Diabetes',
    },
    {
      id: '2',
      title: 'Cardiovascular Health Study',
      organization: 'Heart Health Foundation',
      description: 'Long-term study on cardiovascular disease prevention',
      compensation: 75,
      duration: '12 months',
      participants: 200,
      status: 'open',
      category: 'Cardiovascular',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Active Studies</h1>
          <p className="text-muted-foreground">
            Browse and apply to research studies
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search studies..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="space-y-4">
          {studies.map((study) => (
            <Card key={study.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{study.title}</CardTitle>
                    <CardDescription>{study.organization}</CardDescription>
                  </div>
                  <Badge variant={study.status === 'open' ? 'success' : 'default'}>
                    {study.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{study.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Compensation</p>
                      <p className="font-semibold">{study.compensation} HBAR</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{study.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="font-semibold">{study.participants}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <Badge variant="info" className="mt-1">{study.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Apply Now</Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {studies.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active studies available</p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}

export default function PatientStudiesPage() {
  return (
    <PatientProtectedRoute>
      <PatientStudiesContent />
    </PatientProtectedRoute>
  );
}

