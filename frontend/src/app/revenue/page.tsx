import Link from 'next/link';
import { DollarSign, TrendingUp, Users, Building2, Activity, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RevenuePage() {
  // Example transaction (you can replace with real HashScan links)
  const exampleTransactionId = '0.0.123456@1234567890.123456789';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold">Revenue Sharing & Transparency</h1>
            <p className="mb-4 text-2xl">Fair, Automatic, Transparent</p>
            <p className="text-lg opacity-90">
              Every dataset sale is automatically distributed using smart contracts. All
              transactions are visible on HashScan for complete transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Revenue Split */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Revenue Distribution</h2>
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-blue-200 text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="mb-2 text-3xl font-bold text-blue-600">60%</CardTitle>
                  <CardTitle className="text-lg">Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Patients receive the majority share of revenue when their anonymized data is
                    used for research.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <Building2 className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="mb-2 text-3xl font-bold text-green-600">25%</CardTitle>
                  <CardTitle className="text-lg">Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Hospitals receive revenue for providing and managing patient data securely.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-teal-200 text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
                    <Activity className="h-10 w-10 text-teal-600" />
                  </div>
                  <CardTitle className="mb-2 text-3xl font-bold text-teal-600">15%</CardTitle>
                  <CardTitle className="text-lg">Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Platform fee covers infrastructure, security, and ongoing development.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Visual Flow */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
              <CardHeader>
                <CardTitle className="text-center">Revenue Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="mb-2 rounded-lg bg-white p-4 shadow-md">
                      <DollarSign className="mx-auto mb-2 h-8 w-8 text-green-600" />
                      <p className="font-semibold">Researcher</p>
                      <p className="text-sm text-gray-600">Pays 100 HBAR</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="mb-2 rounded-lg bg-white p-4 shadow-md">
                      <Activity className="mx-auto mb-2 h-8 w-8 text-teal-600" />
                      <p className="font-semibold">Smart Contract</p>
                      <p className="text-sm text-gray-600">Auto Distribution</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-blue-100 p-3 text-center">
                      <p className="font-bold text-blue-600">60 HBAR</p>
                      <p className="text-xs text-gray-600">Patient</p>
                    </div>
                    <div className="rounded-lg bg-green-100 p-3 text-center">
                      <p className="font-bold text-green-600">25 HBAR</p>
                      <p className="text-xs text-gray-600">Hospital</p>
                    </div>
                    <div className="rounded-lg bg-teal-100 p-3 text-center">
                      <p className="font-bold text-teal-600">15 HBAR</p>
                      <p className="text-xs text-gray-600">Platform</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Smart Contract Automation */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Smart Contract Automation</h2>
          <div className="mx-auto max-w-4xl">
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-teal-600" />
                  RevenueSplitter Smart Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  All revenue distribution is handled automatically by our RevenueSplitter smart
                  contract on Hedera EVM:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Automatic 60/25/15 split calculation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Instant HBAR distribution to Hedera Account IDs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>No manual processing or waiting periods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>All transactions recorded on blockchain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Transparent and verifiable on HashScan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Example Transaction */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Example Transaction</h2>
          <div className="mx-auto max-w-4xl">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Dataset Sale: 100 HBAR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="mb-1 text-sm text-gray-600">Patient Share</p>
                    <p className="text-2xl font-bold text-blue-600">60 HBAR</p>
                    <p className="mt-1 text-xs text-gray-500">60% of total</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="mb-1 text-sm text-gray-600">Hospital Share</p>
                    <p className="text-2xl font-bold text-green-600">25 HBAR</p>
                    <p className="mt-1 text-xs text-gray-500">25% of total</p>
                  </div>
                  <div className="rounded-lg bg-teal-50 p-4">
                    <p className="mb-1 text-sm text-gray-600">Platform Share</p>
                    <p className="text-2xl font-bold text-teal-600">15 HBAR</p>
                    <p className="mt-1 text-xs text-gray-500">15% of total</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm text-gray-600">Transaction ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 p-2 font-mono text-sm">
                      {exampleTransactionId}
                    </code>
                    <a
                      href={`https://hashscan.io/testnet/transaction/${exampleTransactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                    >
                      View on HashScan
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Our Revenue Model Works</h2>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-8 w-8 text-green-600" />
                <CardTitle>Fair Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Patients receive the majority share (60%), ensuring they are fairly compensated
                  for their data contribution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="mb-2 h-8 w-8 text-blue-600" />
                <CardTitle>Automatic Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  No waiting, no manual processing. Revenue is distributed instantly via smart
                  contract when datasets are sold.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="mb-2 h-8 w-8 text-teal-600" />
                <CardTitle>Transparent Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All transactions are visible on HashScan. Track every payment, verify every
                  distribution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="mb-2 h-8 w-8 text-purple-600" />
                <CardTitle>Smart Contract Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Revenue distribution is enforced by smart contract code, eliminating the
                  possibility of errors or manipulation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Participate?</h2>
          <p className="mb-8 text-xl opacity-90">
            Join patients, hospitals, and researchers in the transparent healthcare data economy
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/solutions/patients">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                For Patients
              </Button>
            </Link>
            <Link href="/solutions/hospitals">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                For Hospitals
              </Button>
            </Link>
            <Link href="/solutions/researchers">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                For Researchers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

