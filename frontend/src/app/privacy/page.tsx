import Link from 'next/link';
import { Shield, Lock, Database, Activity, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy & Compliance</h1>
            <p className="text-2xl mb-4">Your Privacy is at the Heart of Our Platform</p>
            <p className="text-lg opacity-90">
              Built for healthcare institutions that demand the highest standards of data protection and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Compliance Standards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Full compliance with Health Insurance Portability and Accountability Act (HIPAA) regulations
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <Database className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>FHIR R4 Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Industry-standard Fast Healthcare Interoperability Resources (FHIR) R4 format
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <Lock className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>GDPR Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Designed with General Data Protection Regulation (GDPR) principles in mind
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200">
              <CardHeader>
                <Activity className="w-10 h-10 text-teal-600 mb-2" />
                <CardTitle>HITRUST Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Architecture designed to meet HITRUST Common Security Framework requirements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Handling Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Data Handling Process</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold">
                    1
                  </div>
                  Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Hospitals upload patient data via secure FHIR R4 interface. All data is encrypted in transit using TLS 1.3.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold">
                    2
                  </div>
                  Anonymization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Advanced anonymization process removes all personally identifiable information (PII):
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Names, addresses, phone numbers, email addresses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Date of birth (replaced with age range)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Social security numbers, national IDs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Any other direct identifiers</span>
                    </li>
                  </ul>
                  <p className="text-gray-600 mt-3">
                    Medical data (diagnoses, treatments, lab results) is preserved for research value.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold">
                    3
                  </div>
                  Tokenization & Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Anonymized data is tokenized and stored in encrypted databases. All data at rest is encrypted using AES-256 encryption.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold">
                    4
                  </div>
                  Blockchain Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Consent and data authenticity are recorded on Hedera Consensus Service (HCS) for immutable proof. 
                  All transactions are visible on HashScan for complete transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Consent & Withdrawal */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Consent & Withdrawal</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Patient Consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Patients provide explicit consent before their data can be used for research. Consent is:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Recorded on Hedera blockchain for immutable proof</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Stored in FHIR Consent resource format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Transparent and verifiable on HashScan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Patients can withdraw consent at any time:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Withdrawal request recorded on blockchain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Future data sales are blocked immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Previously sold data cannot be recalled (already anonymized)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Security Measures</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Lock className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Encryption keys are managed securely.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Blockchain Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Built on Hedera Hashgraph, one of the most secure and energy-efficient blockchain networks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Access Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Role-based access controls ensure only authorized users can access specific data and features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="w-8 h-8 text-teal-600 mb-2" />
                <CardTitle>Audit Trails</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All data access and transactions are logged and visible on HashScan for complete transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Can buyers re-identify patients?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No. By design, all personally identifiable information (PII) is removed during anonymization. 
                  The anonymization process is irreversible, and buyers receive only anonymized data with no way to re-identify patients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How is consent verified?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Consent is recorded on Hedera Consensus Service (HCS) for immutable proof. 
                  You can verify any consent record on HashScan using the transaction ID. 
                  Consent is stored in FHIR Consent resource format for interoperability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens if I withdraw consent?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your withdrawal is immediately recorded on blockchain. Future data sales will be blocked. 
                  However, data that was already sold and anonymized cannot be recalled, as it no longer contains any identifying information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How can I verify my data is secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All transactions and consent records are visible on HashScan. You can view your consent records, 
                  revenue distributions, and data access logs. The blockchain provides complete transparency and auditability.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Have More Questions?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us for more information about our privacy and security practices
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

