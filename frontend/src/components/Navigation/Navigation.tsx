'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Building2,
  Database,
  Settings,
  LogOut,
  User,
  ShoppingBag,
} from 'lucide-react';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: 'patient' | 'hospital' | 'researcher' | 'admin';
}

const navigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'For Patients', href: '/for-patients', icon: Users },
  { name: 'For Hospitals', href: '/for-hospitals', icon: Building2 },
  { name: 'For Researchers', href: '/for-researchers', icon: Database },
  { name: 'Patients', href: '/patient/dashboard', icon: Users, requiresAuth: 'patient' },
  { name: 'Hospitals', href: '/hospital/dashboard', icon: Building2, requiresAuth: 'hospital' },
  {
    name: 'Researchers',
    href: '/researcher/dashboard',
    icon: Database,
    requiresAuth: 'researcher',
  },
  { name: 'Admin', href: '/admin/dashboard', icon: Settings, requiresAuth: 'admin' },
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
  const { logout: logoutAdmin, isAuthenticated: isAdminAuthenticated } = useAdminSession();

  // Check researcher authentication
  const [isResearcherAuthenticated, setIsResearcherAuthenticated] = useState(false);

  useEffect(() => {
    // Check if researcher is authenticated
    const researcherId = sessionStorage.getItem('researcherId');
    setIsResearcherAuthenticated(!!researcherId);
  }, [pathname]); // Re-check when pathname changes

  const handleLogout = () => {
    if (isPatientAuthenticated) {
      logoutPatient();
      router.push('/patient/login');
    }
    if (isHospitalAuthenticated) {
      logoutHospital();
      router.push('/hospital/login');
    }
    if (isAdminAuthenticated) {
      logoutAdmin();
      router.push('/admin/login');
    }
    // Researcher logout
    if (isResearcherAuthenticated) {
      sessionStorage.removeItem('researcherId');
      sessionStorage.removeItem('researcherEmail');
      setIsResearcherAuthenticated(false);
      router.push('/researcher/register');
    }
  };

  // Filter navigation items based on authentication
  const visibleNavItems = navigation.filter((item) => {
    // Always show public items
    if (!item.requiresAuth) return true;

    // Show role-specific items only if user is authenticated for that role
    if (item.requiresAuth === 'patient') return isPatientAuthenticated;
    if (item.requiresAuth === 'hospital') return isHospitalAuthenticated;
    if (item.requiresAuth === 'researcher') return isResearcherAuthenticated;
    if (item.requiresAuth === 'admin') return isAdminAuthenticated;

    return false;
  });

  const isPatientPage = pathname?.startsWith('/patient');
  const isHospitalPage = pathname?.startsWith('/hospital');
  const isResearcherPage = pathname?.startsWith('/researcher');
  const isAdminPage = pathname?.startsWith('/admin');

  const isAnyAuthenticated =
    isPatientAuthenticated ||
    isHospitalAuthenticated ||
    isResearcherAuthenticated ||
    isAdminAuthenticated;

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary">
              MediPact
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              {visibleNavItems.map((item) => {
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
            {isResearcherAuthenticated && (
              <div className="hidden items-center gap-2 text-sm md:flex">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Researcher</span>
              </div>
            )}
            {isAdminAuthenticated && (
              <div className="hidden items-center gap-2 text-sm md:flex">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Admin</span>
              </div>
            )}
            {isAnyAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
            {!isAnyAuthenticated && (
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
                {isResearcherPage && (
                  <Link href="/researcher/register">
                    <Button variant="outline" size="sm">
                      Register
                    </Button>
                  </Link>
                )}
                {isAdminPage && (
                  <Link href="/admin/login">
                    <Button variant="outline" size="sm">
                      Admin Login
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

