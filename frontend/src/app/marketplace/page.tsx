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
      <section className="bg-gradient-to-br from-teal-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Data Marketplace</h1>
            <p className="text-2xl mb-4">Verified, Anonymized Medical Datasets for Research</p>
            <p className="text-lg mb-8 opacity-90">
              Browse ethically-sourced medical datasets. Full access requires researcher registration and verification.
            </p>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="bg-blue-50 border-b border-blue-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-blue-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              <strong>Registration Required:</strong> To view dataset details and purchase, you must register as a researcher and complete verification.
            </p>
          </div>
        </div>
      </section>

      {/* Dataset Catalog Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Datasets</h2>
              <p className="text-gray-600">Preview of available datasets. Register to see full details.</p>
            </div>
            <Link href="/researcher/register">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Register as Researcher
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sampleDatasets.map((dataset) => (
              <Card key={dataset.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="bg-green-500">Available</Badge>
                    <Database className="w-5 h-5 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl">{dataset.name}</CardTitle>
                  <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Records</p>
                      <p className="font-semibold">{dataset.records}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Format</p>
                      <p className="font-semibold">{dataset.format}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Disease Area</p>
                      <p className="font-semibold">{dataset.diseaseArea}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Status</p>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {dataset.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
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
          <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Access Full Datasets?</h3>
                  <p className="text-gray-600 mb-4">
                    Register as a researcher to view complete dataset details, pricing, and purchase options.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>View complete dataset schemas and metadata</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Access pricing and bulk purchase options</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Download datasets in CSV and FHIR formats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Trust Our Marketplace?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-teal-600 mb-2" />
                <CardTitle>Verified Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All datasets come from verified hospitals with patient consent recorded on blockchain
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="w-10 h-10 text-teal-600 mb-2" />
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
                <FileDown className="w-10 h-10 text-teal-600 mb-2" />
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

