'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Upload, 
  Shield, 
  Users, 
  DollarSign, 
  Settings,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16">
      <nav className="p-4 space-y-1">
        {hospitalNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-600 border border-green-200'
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

