'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Activity, 
  Settings, 
  Building2,
  ShoppingBag
} from 'lucide-react';

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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16">
      <nav className="p-4 space-y-1">
        {patientNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

