'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Database, 
  TrendingUp, 
  FileDown, 
  BarChart3,
  Settings
} from 'lucide-react';

const researcherNavItems = [
  { name: 'Dashboard', href: '/researcher/dashboard', icon: LayoutDashboard },
  { name: 'Browse Catalog', href: '/researcher/catalog', icon: Database },
  { name: 'My Projects', href: '/researcher/projects', icon: TrendingUp },
  { name: 'Purchase History', href: '/researcher/purchases', icon: FileDown },
  { name: 'Analytics', href: '/researcher/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/researcher/settings', icon: Settings },
];

export function ResearcherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-16">
      <nav className="p-4 space-y-1">
        {researcherNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-600 border border-purple-200'
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

