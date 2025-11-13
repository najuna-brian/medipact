'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  Shield,
  Users,
  DollarSign,
  Settings,
  FileCheck,
  CheckCircle2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const hospitalNavItems = [
  { name: 'Dashboard', href: '/hospital/dashboard', icon: LayoutDashboard },
  { name: 'Upload Data', href: '/hospital/upload', icon: Upload },
  { name: 'Consent Management', href: '/hospital/consent', icon: Shield },
  { name: 'Patient Enrollment', href: '/hospital/enrollment', icon: Users },
  { name: 'Processing', href: '/hospital/processing', icon: FileCheck },
  { name: 'Revenue', href: '/hospital/revenue', icon: DollarSign },
  { name: 'Verification', href: '/hospital/verification', icon: CheckCircle2 },
  { name: 'Settings', href: '/hospital/settings', icon: Settings },
];

export function HospitalSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hospitalSidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('hospitalSidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed left-0 right-0 top-16 z-50 border-b border-gray-200 bg-white px-4 py-2 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span>Menu</span>
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="fixed left-0 top-16 z-50 min-h-screen w-64 overflow-y-auto border-r border-gray-200 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1 p-4">
              {hospitalNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'border border-green-200 bg-green-50 text-green-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-10 hidden min-h-screen border-r border-gray-200 bg-white transition-all duration-300 md:block',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-1 p-4">
            {hospitalNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border border-green-200 bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="w-full justify-center"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

