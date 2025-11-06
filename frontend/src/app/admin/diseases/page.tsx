import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function AdminDiseasesPage() {
  const diseases = [
    { id: '1', name: 'Diabetes', category: 'Metabolic', datasets: 15, status: 'active' },
    { id: '2', name: 'Cardiovascular Disease', category: 'Cardiac', datasets: 12, status: 'active' },
    { id: '3', name: 'Cancer', category: 'Oncology', datasets: 8, status: 'active' },
    { id: '4', name: 'Hypertension', category: 'Cardiac', datasets: 10, status: 'active' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Disease Management</h1>
            <p className="text-muted-foreground">
              Manage disease categories and dataset types
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Disease
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search diseases..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map((disease) => (
            <Card key={disease.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-1">{disease.name}</CardTitle>
                    <CardDescription>{disease.category}</CardDescription>
                  </div>
                  <Badge variant={disease.status === 'active' ? 'success' : 'default'}>
                    {disease.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Datasets</p>
                    <p className="text-xl font-bold">{disease.datasets}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

