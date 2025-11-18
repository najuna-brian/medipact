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
  BookOpen,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { usePatientSession } from '@/hooks/usePatientSession';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: 'patient' | 'hospital' | 'researcher' | 'admin';
}

const publicNavigation: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
];

const solutionsNavigation = [
  { name: 'For Patients', href: '/solutions/patients', icon: Users },
  { name: 'For Hospitals', href: '/solutions/hospitals', icon: Building2 },
  { name: 'For Researchers', href: '/solutions/researchers', icon: Database },
];

const resourcesNavigation = [
  { name: 'Documentation', href: '/docs', icon: BookOpen },
  { name: 'Pricing', href: '/pricing', icon: ShoppingBag },
  { name: 'About', href: '/about', icon: Home },
];

const authNavigation: NavItem[] = [
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
  const solutionsDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if researcher is authenticated
    const researcherId = sessionStorage.getItem('researcherId');
    setIsResearcherAuthenticated(!!researcherId);
  }, [pathname]); // Re-check when pathname changes

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        solutionsDropdownRef.current &&
        !solutionsDropdownRef.current.contains(event.target as Node)
      ) {
        setSolutionsDropdownOpen(false);
      }
      if (
        resourcesDropdownRef.current &&
        !resourcesDropdownRef.current.contains(event.target as Node)
      ) {
        setResourcesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      router.push('/researcher/login');
    }
  };

  // Filter auth navigation items based on authentication
  const visibleAuthNavItems = authNavigation.filter((item) => {
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
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <div className="flex flex-col gap-0.5">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-blue-600 transition-colors hover:text-blue-700"
            >
              MediPact
            </Link>
            <span className="hidden text-xs font-normal text-gray-600 lg:block">
              True Healthcare Data Ownership
            </span>
          </div>

          {/* Right: Desktop Navigation, User Context, and Mobile Menu */}
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <div className="hidden items-center gap-0.5 xl:flex">
              {publicNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </Link>
                );
              })}

              {/* Solutions Dropdown */}
              {!isAnyAuthenticated && (
                <div className="relative" ref={solutionsDropdownRef}>
                  <button
                    onClick={() => {
                      setSolutionsDropdownOpen(!solutionsDropdownOpen);
                      setResourcesDropdownOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors',
                      pathname?.startsWith('/solutions')
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    )}
                  >
                    Solutions
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        solutionsDropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {solutionsDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-gray-200 bg-white py-1.5 shadow-xl">
                      {solutionsNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setSolutionsDropdownOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-gray-50 font-medium text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            <item.icon className="h-4 w-4 text-gray-400" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Resources Dropdown */}
              {!isAnyAuthenticated && (
                <div className="relative" ref={resourcesDropdownRef}>
                  <button
                    onClick={() => {
                      setResourcesDropdownOpen(!resourcesDropdownOpen);
                      setSolutionsDropdownOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors',
                      pathname?.startsWith('/docs') ||
                        pathname === '/pricing' ||
                        pathname === '/about'
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    )}
                  >
                    Resources
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        resourcesDropdownOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {resourcesDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-gray-200 bg-white py-1.5 shadow-xl">
                      {resourcesNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setResourcesDropdownOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-gray-50 font-medium text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            )}
                          >
                            <item.icon className="h-4 w-4 text-gray-400" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Auth Navigation Items */}
              {visibleAuthNavItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>
            {/* User Context */}
            {isAnyAuthenticated && (
              <div className="hidden items-center gap-3 md:flex">
                {isPatientAuthenticated && upi && (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{upi}</span>
                  </div>
                )}
                {isHospitalAuthenticated && hospitalId && (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{hospitalId}</span>
                  </div>
                )}
                {isResearcherAuthenticated && (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                    <Database className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Researcher</span>
                  </div>
                )}
                {isAdminAuthenticated && (
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                    <Settings className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">Admin</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 xl:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white xl:hidden">
            <div className="space-y-1 px-4 py-3">
              {publicNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-50 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    {item.name}
                  </Link>
                );
              })}

              {!isAnyAuthenticated && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Solutions
                  </div>
                  {solutionsNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
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

                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Resources
                  </div>
                  {resourcesNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
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
                </>
              )}

              {visibleAuthNavItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gray-50 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-4 w-4 text-gray-400" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

