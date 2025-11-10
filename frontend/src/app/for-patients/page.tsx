import Link from 'next/link';
import { ArrowRight, FileText, DollarSign, Shield, Globe, Lock, Heart, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ForPatientsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">For Patients</h1>
            <p className="text-2xl mb-4">Your Health Data, Your Control, Your Earnings</p>
            <p className="text-lg mb-8 opacity-90">
              Store your medical records securely, access them anywhere, and earn money when researchers use your anonymized data for medical breakthroughs.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/patient/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Proposition */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Personal Health Vault */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Your Personal Health Vault</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Never lose track of your medical records again. Store all your health information in one secure, accessible place.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Access Anywhere, Anytime</p>
                      <p className="text-sm text-gray-600">View your complete medical history from any device, anywhere in the world</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Secure & Private</p>
                      <p className="text-sm text-gray-600">Your records are encrypted and stored securely using blockchain technology</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Complete History</p>
                      <p className="text-sm text-gray-600">Connect with hospitals to automatically sync all your medical records</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Earn From Your Data */}
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-teal-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-2xl">Earn From Your Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Help advance medical research while earning money. Your anonymized health data helps researchers find cures and treatments.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">60% Revenue Share</p>
                      <p className="text-sm text-gray-600">Earn 60% of revenue automatically when researchers purchase your anonymized data</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Your Privacy Protected</p>
                      <p className="text-sm text-gray-600">All personal information is removed before data is shared with researchers</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">You're In Control</p>
                      <p className="text-sm text-gray-600">You decide which studies to participate in and can opt out anytime</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works for Patients</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Sign Up & Connect</h3>
              <p className="text-gray-600">
                Create your account and connect with your hospital to sync your medical records automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Your Records Are Stored</h3>
              <p className="text-gray-600">
                All your medical records are securely stored and accessible from anywhere. You own your data.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Earn & Access</h3>
              <p className="text-gray-600">
                When researchers need anonymized data, you get paid automatically. Access your records anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MediPact?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Blockchain Secured</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Built on Hedera blockchain for immutable proof and security
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>60% Revenue Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Highest patient revenue share in the industry
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="w-10 h-10 text-teal-600 mb-2" />
                <CardTitle>Global Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Access your records from anywhere in the world
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Lock className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Full compliance with healthcare data protection regulations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Health Data?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of patients who are storing their records securely and earning from their data
          </p>
          <Link href="/patient/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

