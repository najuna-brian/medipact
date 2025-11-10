import Link from 'next/link';
import { ArrowRight, Building2, DollarSign, Shield, Database, FileUp, Users, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ForHospitalsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">For Hospitals</h1>
            <p className="text-2xl mb-4">Streamline Data Management, Ensure Compliance, Generate Revenue</p>
            <p className="text-lg mb-8 opacity-90">
              Upload patient data securely, manage consent, and share revenue with patients when data is used for research—all while maintaining full compliance.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/hospital/login">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  Hospital Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Hospitals Choose MediPact</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">25% Revenue Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn 25% of revenue when your anonymized patient data is purchased by researchers. New revenue stream with zero additional effort.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">Full Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  HIPAA-compliant, FHIR R4 standard, blockchain-verified consent. All compliance requirements handled automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <FileUp className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">FHIR R4 Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload data in industry-standard FHIR R4 format. Seamless integration with existing hospital systems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works for Hospitals</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect & Register</h3>
              <p className="text-sm text-gray-600">
                Register your hospital and get your Hedera Account ID for automatic revenue distribution.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Data</h3>
              <p className="text-sm text-gray-600">
                Upload patient data via FHIR R4 format. Our adapter automatically processes and anonymizes.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Consent</h3>
              <p className="text-sm text-gray-600">
                Patients connect and provide consent. All consent is recorded on blockchain for immutable proof.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Earn Revenue</h3>
              <p className="text-sm text-gray-600">
                When researchers purchase datasets, you automatically receive 25% revenue share via HBAR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hospital Features</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-green-600" />
                  <CardTitle>FHIR R4 Compliant</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Industry-standard FHIR R4 format for seamless integration with existing hospital systems and EHRs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <CardTitle>Patient Enrollment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Easy patient enrollment and linkage system. Patients can connect their accounts automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <CardTitle>Consent Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Comprehensive consent management dashboard. All consent recorded on Hedera blockchain.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <CardTitle>Revenue Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Real-time revenue tracking and analytics. View all transactions and earnings in your dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-green-600" />
                  <CardTitle>Automatic Anonymization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Advanced anonymization removes all PII while preserving medical data value for research.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <CardTitle>Verification System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Hospital verification system ensures only legitimate healthcare institutions can participate.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Streamline Your Hospital Operations?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
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

