import Link from 'next/link';
import { ArrowRight, Shield, DollarSign, Database, Activity } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-medical-blue to-medical-teal text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              MediPact
            </h1>
            <p className="text-2xl mb-4">The Verifiable Health Pact. Built on Hedera.</p>
            <p className="text-lg mb-8 opacity-90">
              A verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/patient/dashboard"
                className="bg-white text-medical-blue px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                For Patients
              </Link>
              <Link
                href="/hospital/dashboard"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-medical-blue transition"
              >
                For Hospitals
              </Link>
              <Link
                href="/researcher/catalog"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-medical-blue transition"
              >
                For Researchers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="w-12 h-12 text-medical-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Immutable Proof</h3>
              <p className="text-gray-600">
                Hedera Consensus Service creates immutable proof of consent and data authenticity.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <DollarSign className="w-12 h-12 text-medical-green mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fair Compensation</h3>
              <p className="text-gray-600">
                Patients receive 60% of revenue via HBAR micropayments automatically.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Database className="w-12 h-12 text-medical-teal mb-4" />
              <h3 className="text-xl font-semibold mb-2">Anonymized Data</h3>
              <p className="text-gray-600">
                PII is removed while preserving medical data for research purposes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Activity className="w-12 h-12 text-medical-purple mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transparent</h3>
              <p className="text-gray-600">
                All transactions visible on HashScan for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the verifiable healthcare data marketplace
          </p>
          <Link
            href="/admin/processing"
            className="inline-flex items-center gap-2 bg-medical-blue text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            View Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

