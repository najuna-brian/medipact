import Link from 'next/link';
import { ArrowRight, Building2, DollarSign, Shield, Database, FileUp, Users, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ForHospitalsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold">For Hospitals</h1>
            <p className="mb-4 text-2xl">
              Streamline Data Management, Ensure Compliance, Generate Revenue
            </p>
            <p className="mb-8 text-lg opacity-90">
              Upload patient data securely, manage consent, and share revenue with patients when
              data is used for research—all while maintaining full compliance.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/hospital/login">
                <Button
                  size="lg"
                  className="bg-white font-semibold text-green-600 shadow-lg transition-all hover:bg-green-50 hover:shadow-xl"
                >
                  Hospital Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="border-2 border-white bg-green-500 font-semibold text-white shadow-lg transition-all hover:bg-green-600 hover:shadow-xl"
                >
                  View Marketplace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Hospitals Choose MediPact</h2>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">25% Revenue Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn 25% of revenue when your anonymized patient data is purchased by researchers.
                  New revenue stream with zero additional effort.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                  <Shield className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">Full Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  HIPAA-compliant, FHIR R4 standard, blockchain-verified consent. All compliance
                  requirements handled automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                  <FileUp className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">FHIR R4 Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload data in industry-standard FHIR R4 format. Seamless integration with
                  existing hospital systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works for Hospitals</h2>
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold">Connect & Register</h3>
              <p className="text-sm text-gray-600">
                Register your hospital and get your Hedera Account ID for automatic revenue
                distribution.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold">Upload Data</h3>
              <p className="text-sm text-gray-600">
                Upload patient data via FHIR R4 format. Our adapter automatically processes and
                anonymizes.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold">Manage Consent</h3>
              <p className="text-sm text-gray-600">
                Patients connect and provide consent. All consent is recorded on blockchain for
                immutable proof.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white">
                4
              </div>
              <h3 className="mb-2 text-lg font-semibold">Earn Revenue</h3>
              <p className="text-sm text-gray-600">
                When researchers purchase datasets, you automatically receive 25% revenue share via
                HBAR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Hospital Features</h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-green-600" />
                  <CardTitle>FHIR R4 Compliant</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Industry-standard FHIR R4 format for seamless integration with existing hospital
                  systems and EHRs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  <CardTitle>Patient Enrollment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Easy patient enrollment and linkage system. Patients can connect their accounts
                  automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <CardTitle>Consent Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Comprehensive consent management dashboard. All consent recorded on Hedera
                  blockchain.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <CardTitle>Revenue Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Real-time revenue tracking and analytics. View all transactions and earnings in
                  your dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-green-600" />
                  <CardTitle>Automatic Anonymization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Advanced anonymization removes all PII while preserving medical data value for
                  research.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <CardTitle>Verification System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Hospital verification system ensures only legitimate healthcare institutions can
                  participate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Streamline Your Hospital Operations?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join leading hospitals worldwide in the future of medical data management
          </p>
          <Link href="/hospital/login">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
              Access Hospital Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

