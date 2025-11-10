import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  DollarSign,
  Database,
  Activity,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Brain,
  Globe,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Marketplace Primary, Health Vault Secondary */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 py-24 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            {/* Trust Badge */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-teal-400" />
              <span className="text-sm font-medium text-teal-200">
                HIPAA Compliant • Blockchain Secured • Enterprise Grade
              </span>
            </div>

            <div className="mb-12 text-center">
              <h1 className="mb-6 text-6xl font-bold leading-tight md:text-7xl">MediPact</h1>
              <p className="mb-4 text-2xl font-light text-blue-100 md:text-3xl">
                Enterprise Healthcare Data Platform
              </p>
              <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-blue-200 md:text-xl">
                Secure medical records storage meets ethical data marketplace. Patients control
                their health data, researchers access quality datasets, and healthcare institutions
                streamline operations—all on blockchain.
              </p>
            </div>

            {/* Dual Value Proposition Cards - Marketplace Primary, Health Vault Secondary */}
            <div className="mx-auto mb-12 grid max-w-5xl gap-6 md:grid-cols-2">
              {/* Research Data Marketplace - PRIMARY */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg transition-all hover:bg-white/15">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-teal-500 p-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Research Data Marketplace</h3>
                </div>
                <p className="mb-4 text-blue-100">
                  Access verified, anonymized medical datasets for research. Patients earn,
                  researchers discover, healthcare advances.
                </p>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 font-medium text-white transition hover:text-teal-300"
                >
                  Browse Marketplace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Personal Health Vault - SECONDARY */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg transition-all hover:bg-white/15">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500 p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Your Personal Health Vault</h3>
                </div>
                <p className="mb-4 text-blue-100">
                  Store, access, and manage your complete medical history from anywhere. Your
                  records, your control, always available.
                </p>
                <Link
                  href="/for-patients"
                  className="inline-flex items-center gap-2 font-medium text-white transition hover:text-teal-300"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Quick Access Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/for-patients"
                className="rounded-lg bg-white px-8 py-4 font-semibold text-slate-900 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
              >
                For Patients
              </Link>
              <Link
                href="/for-hospitals"
                className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
              >
                For Hospitals
              </Link>
              <Link
                href="/for-researchers"
                className="rounded-lg bg-teal-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-teal-700 hover:shadow-xl"
              >
                For Researchers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who Benefits Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Built for Healthcare Excellence
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Whether you're a patient, healthcare provider, researcher, or AI company, MediPact
              provides the tools you need
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Patients */}
            <div className="rounded-xl border-2 border-blue-100 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">For Patients</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Store your medical records securely, access them anywhere, and earn when researchers
                use your anonymized data.
              </p>
              <Link
                href="/for-patients"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Hospitals */}
            <div className="rounded-xl border-2 border-green-100 bg-white p-6 transition-all hover:border-green-300 hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                <Building2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">For Hospitals</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Streamline patient data management, ensure compliance, and share revenue with
                patients when data is used for research.
              </p>
              <Link
                href="/for-hospitals"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Researchers & Buyers */}
            <div className="rounded-xl border-2 border-purple-100 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50">
                <Brain className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">For Researchers & Buyers</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Access verified, anonymized medical datasets for AI, clinical research, and drug
                development.
              </p>
              <Link
                href="/for-researchers"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Built for healthcare institutions that demand the highest standards
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Blockchain Secured</h3>
              <p className="text-sm text-gray-600">
                Immutable proof of consent and data authenticity via Hedera Consensus Service
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">HIPAA Compliant</h3>
              <p className="text-sm text-gray-600">
                Full compliance with healthcare data protection regulations
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">FHIR R4 Standard</h3>
              <p className="text-sm text-gray-600">
                Industry-standard data formats for seamless integration
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
                <Activity className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">Transparent & Auditable</h3>
              <p className="text-sm text-gray-600">
                All transactions visible on HashScan for complete transparency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              A streamlined process designed for healthcare professionals
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Connect & Upload</h3>
              <p className="leading-relaxed text-gray-600">
                Hospitals upload patient data via FHIR-compliant interface. Patients connect their
                accounts to access records.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Anonymize & Verify</h3>
              <p className="leading-relaxed text-gray-600">
                Advanced anonymization removes PII while preserving research value. Blockchain
                verification ensures authenticity.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Access & Earn</h3>
              <p className="leading-relaxed text-gray-600">
                Researchers purchase datasets. Patients receive 60% revenue automatically.
                Healthcare advances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-teal-400">100%</div>
              <p className="text-gray-400">Anonymized</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-teal-400">60%</div>
              <p className="text-gray-400">Patient Revenue Share</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-teal-400">24/7</div>
              <p className="text-gray-400">Access Available</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-teal-400">FHIR</div>
              <p className="text-gray-400">Compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Transform Healthcare Data?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join leading healthcare institutions, researchers, and patients in the future of medical
            data
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/for-patients"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
            >
              Start as Patient <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/for-hospitals"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-800 hover:shadow-xl"
            >
              Hospital Portal <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/for-researchers"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-teal-800 hover:shadow-xl"
            >
              Researcher Access <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

