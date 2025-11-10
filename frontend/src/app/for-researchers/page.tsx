import Link from 'next/link';
import { ArrowRight, Brain, Database, Shield, FileDown, CheckCircle2, Microscope, FlaskConical, Code, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ForResearchersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">For Researchers & Data Buyers</h1>
            <p className="text-2xl mb-4">Access Verified, Anonymized Medical Datasets</p>
            <p className="text-lg mb-8 opacity-90">
              Whether you're building AI models, conducting clinical trials, or developing new treatments, 
              access high-quality, ethically-sourced medical data on MediPact.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/researcher/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                  Register as Researcher
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Built for All Research Needs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* AI/ML Companies */}
            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all">
              <CardHeader>
                <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl">AI & ML Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Train machine learning models with verified, structured medical data. Perfect for diagnostic algorithms, 
                  predictive analytics, and personalized health insights.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>FHIR-structured data for easy integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Bulk purchase options available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>CSV and FHIR Bundle formats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Academic Researchers */}
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all">
              <CardHeader>
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Microscope className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Academic Researchers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Access diverse datasets for clinical studies, population health research, and epidemiological analysis. 
                  Ethical sourcing with full transparency.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Ethical data sourcing verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Compliance-ready datasets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Research license included</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pharmaceutical Companies */}
            <Card className="border-2 border-green-200 hover:border-green-300 transition-all">
              <CardHeader>
                <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <FlaskConical className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">Pharmaceutical Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Identify eligible participants for clinical trials, analyze real-world evidence, and predict treatment 
                  response trends with comprehensive medical datasets.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Clinical trial feasibility studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-world evidence research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Post-market drug performance analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Biotech Companies */}
            <Card className="border-2 border-teal-200 hover:border-teal-300 transition-all">
              <CardHeader>
                <div className="bg-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Code className="w-7 h-7 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Biotech Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Accelerate drug development with high-quality medical data. Analyze disease prevalence, 
                  treatment patterns, and patient outcomes.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Disease prevalence analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Treatment response prediction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>Reduce R&D costs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* HealthTech Companies */}
            <Card className="border-2 border-orange-200 hover:border-orange-300 transition-all">
              <CardHeader>
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl">HealthTech Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Build predictive tools, diagnostic algorithms, and personalized health insights with structured 
                  FHIR-based data. Integrate marketplace data via APIs.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>API integration available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Predictive analytics tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Personalized health insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* NGOs & Non-Profits */}
            <Card className="border-2 border-pink-200 hover:border-pink-300 transition-all">
              <CardHeader>
                <div className="bg-pink-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-pink-600" />
                </div>
                <CardTitle className="text-xl">NGOs & Non-Profits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Conduct public health research, rare disease studies, and population health analysis with 
                  ethically-sourced, verified medical datasets.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>Public health research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>Rare disease studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span>Population health analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Researchers Choose MediPact</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <Database className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>FHIR R4 Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Industry-standard FHIR R4 format for seamless integration with research tools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>Verified & Ethical</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All datasets verified from legitimate hospitals with patient consent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileDown className="w-10 h-10 text-teal-600 mb-2" />
                <CardTitle>Multiple Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  CSV and FHIR Bundle formats available for immediate use
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Research License</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Full research license included with every dataset purchase
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Researcher Verification</h2>
            <p className="text-center text-gray-600 mb-8">
              To ensure ethical data usage, all researchers must complete verification before purchasing datasets.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <CardTitle>Register</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create your researcher account with organization details
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <CardTitle>Submit Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Submit verification documents for admin review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <CardTitle>Get Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Once verified, access full marketplace and purchase datasets
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Access Quality Medical Data?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join leading researchers, AI companies, and institutions worldwide
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/researcher/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

