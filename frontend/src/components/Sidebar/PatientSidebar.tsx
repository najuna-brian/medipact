'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Activity,
  Settings,
  Building2,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const patientNavItems = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { name: 'Health Wallet', href: '/patient/wallet', icon: FileText },
  { name: 'Earnings', href: '/patient/earnings', icon: DollarSign },
  { name: 'Studies', href: '/patient/studies', icon: Activity },
  { name: 'Marketplace', href: '/patient/marketplace', icon: ShoppingBag },
  { name: 'Connect Hospitals', href: '/patient/connect', icon: Building2 },
  { name: 'Settings', href: '/patient/settings', icon: Settings },
];

export function PatientSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              {patientNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'border border-blue-200 bg-blue-50 text-blue-600'
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

      {
        /* Desktop Sidebar */
      }
      <aside className="fixed left-0 top-16 z-10 hidden min-h-screen w-64 border-r border-gray-200 bg-white md:block">
        <nav className="space-y-1 p-4">
          {patientNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border border-blue-200 bg-blue-50 text-blue-600'
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
    </>
  );
}

