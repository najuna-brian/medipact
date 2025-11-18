import Link from 'next/link';
import { ArrowRight, Brain, Database, Shield, FileDown, CheckCircle2, Microscope, FlaskConical, Code, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ForResearchersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold">For Researchers & Data Buyers</h1>
            <p className="mb-4 text-2xl">Access Verified, Anonymized Medical Datasets</p>
            <p className="mb-8 text-lg opacity-90">
              Whether you're building AI models, conducting clinical trials, or developing new
              treatments, access high-quality, ethically-sourced medical data on MediPact.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/researcher/register">
                <Button
                  size="lg"
                  className="bg-white font-semibold text-purple-600 shadow-lg transition-all hover:bg-purple-50 hover:shadow-xl"
                >
                  Register as Researcher
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="border-2 border-white bg-purple-500 font-semibold text-white shadow-lg transition-all hover:bg-purple-600 hover:shadow-xl"
                >
                  Browse Catalog
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Built for All Research Needs</h2>
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* AI/ML Companies */}
            <Card className="border-2 border-purple-200 transition-all hover:border-purple-300">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                  <Brain className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl">AI & ML Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600">
                  Train machine learning models with verified, structured medical data. Perfect for
                  diagnostic algorithms, predictive analytics, and personalized health insights.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span>FHIR-structured data for easy integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span>Bulk purchase options available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span>CSV and FHIR Bundle formats</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Academic Researchers */}
            <Card className="border-2 border-blue-200 transition-all hover:border-blue-300">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                  <Microscope className="h-7 w-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Academic Researchers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600">
                  Access diverse datasets for clinical studies, population health research, and
                  epidemiological analysis. Ethical sourcing with full transparency.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>Ethical data sourcing verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>Compliance-ready datasets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>Research license included</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pharmaceutical Companies */}
            <Card className="border-2 border-green-200 transition-all hover:border-green-300">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                  <FlaskConical className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl">Pharmaceutical Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600">
                  Identify eligible participants for clinical trials, analyze real-world evidence,
                  and predict treatment response trends with comprehensive medical datasets.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Clinical trial feasibility studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Real-world evidence research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Post-market drug performance analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Biotech Companies */}
            <Card className="border-2 border-teal-200 transition-all hover:border-teal-300">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-100">
                  <Code className="h-7 w-7 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Biotech Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600">
                  Accelerate drug development with high-quality medical data. Analyze disease
                  prevalence, treatment patterns, and patient outcomes.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                    <span>Disease prevalence analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                    <span>Treatment response prediction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                    <span>Reduce R&D costs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* HealthTech Companies */}
            <Card className="border-2 border-orange-200 transition-all hover:border-orange-300">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100">
                  <TrendingUp className="h-7 w-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl">HealthTech Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600">
                  Build predictive tools, diagnostic algorithms, and personalized health insights
                  with structured FHIR-based data. Integrate marketplace data via APIs.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span>API integration available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span>Predictive analytics tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span>Personalized health insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* NGOs & Non-Profits */}
            <Card className="border-2 border-pink-200 transition-all hover:border-pink-300">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-pink-100">
                  <Users className="h-7 w-7 text-pink-600" />
                </div>
                <CardTitle className="text-xl">NGOs & Non-Profits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-600">
                  Conduct public health research, rare disease studies, and population health
                  analysis with ethically-sourced, verified medical datasets.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-pink-600" />
                    <span>Public health research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-pink-600" />
                    <span>Rare disease studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-pink-600" />
                    <span>Population health analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Researchers Choose MediPact</h2>
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Database className="mb-2 h-10 w-10 text-purple-600" />
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
                <Shield className="mb-2 h-10 w-10 text-green-600" />
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
                <FileDown className="mb-2 h-10 w-10 text-teal-600" />
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
                <CheckCircle2 className="mb-2 h-10 w-10 text-blue-600" />
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
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-3xl font-bold">Researcher Verification</h2>
            <p className="mb-8 text-center text-gray-600">
              To ensure ethical data usage, all researchers must complete verification before
              purchasing datasets.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white">
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white">
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white">
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
      <section className="bg-gradient-to-br from-purple-600 to-teal-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Access Quality Medical Data?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
            Join leading researchers, AI companies, and institutions worldwide
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/researcher/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

