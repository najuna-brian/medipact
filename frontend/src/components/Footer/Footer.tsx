import Link from 'next/link';
import { Building2, Users, Database, BookOpen, Mail, Shield, FileText, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/solutions/patients"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  For Patients
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/hospitals"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  <Building2 className="h-4 w-4" />
                  For Hospitals
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/researchers"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  <Database className="h-4 w-4" />
                  For Researchers
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  <BookOpen className="h-4 w-4" />
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Legal & Compliance</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/compliance"
                  className="text-sm text-gray-600 transition-colors hover:text-primary"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-sm text-gray-600 md:text-left">
              <p>&copy; {new Date().getFullYear()} MediPact. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/contact"
                className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

