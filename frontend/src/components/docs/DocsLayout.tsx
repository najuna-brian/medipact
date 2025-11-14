'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import {
  BookOpen,
  Home,
  Layers,
  Database,
  Code,
  Shield,
  Zap,
  Users,
  FileText,
  Settings,
  TrendingUp,
} from 'lucide-react';

interface DocsLayoutProps {
  children: ReactNode;
}

const docsNav = [
  { href: '/docs', label: 'Overview', icon: Home },
  { href: '/docs/hedera', label: 'Hedera Integration', icon: Zap },
  { href: '/docs/architecture', label: 'Architecture', icon: Layers },
  { href: '/docs/data-flow', label: 'Data Flow', icon: TrendingUp },
  { href: '/docs/privacy', label: 'Privacy & Security', icon: Shield },
  { href: '/docs/smart-contracts', label: 'Smart Contracts', icon: Code },
  { href: '/docs/database', label: 'Database Schema', icon: Database },
  { href: '/docs/api', label: 'API Reference', icon: FileText },
  { href: '/docs/quick-start', label: 'Quick Start', icon: Settings },
];

export default function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/docs" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-[#00A9CE]" />
              <span className="text-xl font-bold text-gray-900">MediPact Docs</span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
          <nav className="sticky top-0 p-4">
            <ul className="space-y-1">
              {docsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#00A9CE] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <aside className="w-full border-b border-gray-200 bg-white lg:hidden">
          <nav className="overflow-x-auto p-4">
            <ul className="flex space-x-2">
              {docsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#00A9CE] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl prose prose-lg prose-slate">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

