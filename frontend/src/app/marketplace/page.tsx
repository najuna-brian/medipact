import Link from 'next/link';
import { ArrowRight, Database, Shield, Lock, FileDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MarketplacePage() {
  // Sample datasets for preview (public view)
  const sampleDatasets = [
    {
      id: 1,
      name: 'Diabetes Outcomes Dataset',
      description: 'Longitudinal data from verified hospitals tracking diabetes treatment outcomes',
      records: '45,000+',
      format: 'FHIR R4, CSV',
      diseaseArea: 'Endocrinology',
      status: 'Available'
    },
    {
      id: 2,
      name: 'COVID-19 Recovery Cohort',
      description: 'Post-hospitalization follow-ups and recovery tracking data',
      records: '18,000+',
      format: 'FHIR R4, CSV',
      diseaseArea: 'Infectious Disease',
      status: 'Available'
    },
    {
      id: 3,
      name: 'Cardiovascular Health Records',
      description: 'Comprehensive cardiovascular health data from multiple hospitals',
      records: '32,000+',
      format: 'FHIR R4, CSV',
      diseaseArea: 'Cardiology',
      status: 'Available'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-blue-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold">Data Marketplace</h1>
            <p className="mb-4 text-2xl">Verified, Anonymized Medical Datasets for Research</p>
            <p className="mb-8 text-lg opacity-90">
              Browse ethically-sourced medical datasets. Full access requires researcher
              registration and verification.
            </p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-teal-50 py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-start gap-3 text-blue-800">
              <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0" />
              <div>
                <p className="mb-1 font-semibold">Registration Required</p>
                <p className="text-sm">
                  To view dataset details and purchase, you must register as a researcher and
                  complete verification.
                  <Link
                    href="/researcher/register"
                    className="ml-1 font-semibold underline hover:text-blue-900"
                  >
                    Register now →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Catalog Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-gray-900">Available Datasets</h2>
                <p className="text-gray-600">
                  Preview of available datasets. Register to see full details and pricing.
                </p>
              </div>
              <Link href="/researcher/register">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 md:w-auto">
                  Register as Researcher
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
              <p className="text-sm text-teal-900">
                <strong>New to MediPact?</strong> Registration takes less than 5 minutes.
                <Link href="/solutions/researchers" className="ml-1 underline hover:text-teal-700">
                  Learn more about researcher benefits →
                </Link>
              </p>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleDatasets.map((dataset) => (
              <Card key={dataset.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="default" className="bg-green-500">
                      Available
                    </Badge>
                    <Database className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl">{dataset.name}</CardTitle>
                  <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-1 text-gray-500">Records</p>
                      <p className="font-semibold">{dataset.records}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-500">Format</p>
                      <p className="font-semibold">{dataset.format}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-500">Disease Area</p>
                      <p className="font-semibold">{dataset.diseaseArea}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-gray-500">Status</p>
                      <Badge variant="default" className="border-green-600 text-green-600">
                        {dataset.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <Link href="/researcher/register">
                      <Button variant="outline" className="w-full">
                        Register to View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Registration CTA */}
          <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    Ready to Access Full Datasets?
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Register as a researcher to view complete dataset details, pricing, and purchase
                    options.
                  </p>
                  <ul className="mb-6 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>View complete dataset schemas and metadata</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Access pricing and bulk purchase options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Download datasets in CSV and FHIR formats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      <span>Get research license and verification proofs</span>
                    </li>
                  </ul>
                </div>
                <div className="ml-8">
                  <Link href="/researcher/register">
                    <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                      Register Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Trust Our Marketplace?</h2>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-teal-600" />
                <CardTitle>Verified Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All datasets come from verified hospitals with patient consent recorded on
                  blockchain
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="mb-2 h-10 w-10 text-teal-600" />
                <CardTitle>100% Anonymized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All PII removed using advanced anonymization while preserving research value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileDown className="mb-2 h-10 w-10 text-teal-600" />
                <CardTitle>Instant Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Download immediately after purchase in your preferred format
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

