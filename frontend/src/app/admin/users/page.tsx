import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Filter, MoreVertical } from 'lucide-react';

export default function AdminUsersPage() {
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'patient',
      status: 'active',
      joined: new Date('2024-01-01'),
      records: 125,
    },
    {
      id: '2',
      name: 'City General Hospital',
      email: 'admin@cityhospital.com',
      role: 'hospital',
      status: 'active',
      joined: new Date('2023-12-15'),
      records: 2500,
    },
    {
      id: '3',
      name: 'Dr. Jane Smith',
      email: 'jane@research.org',
      role: 'researcher',
      status: 'active',
      joined: new Date('2024-01-10'),
      records: 0,
    },
  ];

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'info' | 'success'> = {
      patient: 'default',
      hospital: 'info',
      researcher: 'success',
    };
    return <Badge variant={variants[role] || 'default'}>{role}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage patients, hospitals, and researchers
            </p>
          </div>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} total users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{user.name}</h3>
                      {getRoleBadge(user.role)}
                      <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>Joined: {user.joined.toLocaleDateString()}</span>
                      {user.records > 0 && (
                        <>
                          <span>•</span>
                          <span>{user.records} records</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

