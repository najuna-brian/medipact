'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Users, Building2, Database, Settings, LogOut, User } from 'lucide-react';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { Button } from '@/components/ui/button';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Patients', href: '/patient/dashboard', icon: Users },
  { name: 'Hospitals', href: '/hospital/dashboard', icon: Building2 },
  { name: 'Researchers', href: '/researcher/dashboard', icon: Database },
  { name: 'Admin', href: '/admin/dashboard', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    upi,
    logout: logoutPatient,
    isAuthenticated: isPatientAuthenticated,
  } = usePatientSession();
  const {
    hospitalId,
    logout: logoutHospital,
    isAuthenticated: isHospitalAuthenticated,
  } = useHospitalSession();

  const handleLogout = () => {
    if (isPatientAuthenticated) {
      logoutPatient();
      router.push('/patient/login');
    }
    if (isHospitalAuthenticated) {
      logoutHospital();
      router.push('/hospital/login');
    }
  };

  const isPatientPage = pathname?.startsWith('/patient');
  const isHospitalPage = pathname?.startsWith('/hospital');

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary">
              MediPact
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              {navigation.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Context */}
          <div className="flex items-center gap-4">
            {isPatientAuthenticated && upi && (
              <div className="hidden items-center gap-2 text-sm md:flex">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{upi}</span>
              </div>
            )}
            {isHospitalAuthenticated && hospitalId && (
              <div className="hidden items-center gap-2 text-sm md:flex">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs">{hospitalId}</span>
              </div>
            )}
            {(isPatientAuthenticated || isHospitalAuthenticated) && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
            {!isPatientAuthenticated && !isHospitalAuthenticated && (
              <div className="flex items-center gap-2">
                {isPatientPage && (
                  <Link href="/patient/login">
                    <Button variant="outline" size="sm">
                      Patient Login
                    </Button>
                  </Link>
                )}
                {isHospitalPage && (
                  <Link href="/hospital/login">
                    <Button variant="outline" size="sm">
                      Hospital Login
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

