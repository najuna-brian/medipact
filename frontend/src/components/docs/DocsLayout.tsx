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
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/docs" className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A9CE]" />
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">MediPact Docs</span>
            </Link>
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              ← Back to App
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        {/* Desktop Sidebar - Show on lg and above */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
          <nav className="sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-y-auto p-3 sm:p-4">
            <ul className="space-y-1">
              {docsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#00A9CE] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Tablet/Mobile Horizontal Sidebar - Show on screens below lg */}
        <aside className="w-full border-b border-gray-200 bg-white lg:hidden">
          <nav className="overflow-x-auto p-2 sm:p-3 md:p-4">
            <ul className="flex space-x-1.5 sm:space-x-2">
              {docsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#00A9CE] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="hidden xs:inline">{item.label}</span>
                      <span className="xs:hidden">{item.label.split(' ')[0]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="prose prose-xs sm:prose-sm md:prose-base lg:prose-lg prose-slate max-w-none prose-headings:scroll-mt-16 sm:prose-headings:scroll-mt-20">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

