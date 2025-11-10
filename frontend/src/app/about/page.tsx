import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Shield,
  DollarSign,
  Database,
  Activity,
  Users,
  Building2,
  Brain,
  FlaskConical,
  TrendingUp,
  Heart,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">About MediPact</h1>
            <p className="text-xl text-muted-foreground">
              The Verifiable Health Pact. Built on Hedera.
            </p>
          </div>

          <div className="mb-12 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  MediPact is a verifiable medical data marketplace that empowers patients to
                  control and monetize their anonymized medical data for research. We solve the
                  patient data black market by creating a transparent, ethical platform using
                  Hedera&apos;s Consensus Service for immutable proof and HBAR for instant
                  micropayments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The Problem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Patients are Exploited</h3>
                  <p className="text-muted-foreground">
                    Medical data is a multi-billion dollar asset. Data brokers buy and sell patient
                    information without knowledge, consent, or compensation. Patients are the
                    product, not the partner.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Researchers are Blind</h3>
                  <p className="text-muted-foreground">
                    Pharmaceutical companies and AI labs need high-quality, diverse data to cure
                    diseases. They&apos;re forced to buy from untrusted brokers with no way to
                    verify if data is real, ethically sourced, or unaltered.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Hospitals are Trapped</h3>
                  <p className="text-muted-foreground">
                    Hospitals (especially government hospitals in developing countries) sit on
                    valuable data but have no safe, legal, or easy way to share it for research.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-1 h-6 w-6 text-primary" />
                    <div>
                      <h3 className="mb-1 font-semibold">Immutable Proof</h3>
                      <p className="text-sm text-muted-foreground">
                        Hedera Consensus Service creates immutable proof of consent and data
                        authenticity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-1 h-6 w-6 text-primary" />
                    <div>
                      <h3 className="mb-1 font-semibold">Fair Compensation</h3>
                      <p className="text-sm text-muted-foreground">
                        Patients receive 60% of revenue via HBAR micropayments automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Database className="mt-1 h-6 w-6 text-primary" />
                    <div>
                      <h3 className="mb-1 font-semibold">Anonymized Data</h3>
                      <p className="text-sm text-muted-foreground">
                        PII is removed while preserving medical data for research purposes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="mt-1 h-6 w-6 text-primary" />
                    <div>
                      <h3 className="mb-1 font-semibold">Transparent</h3>
                      <p className="text-sm text-muted-foreground">
                        All transactions visible on HashScan for complete transparency
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Who We Serve</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  MediPact benefits six major stakeholder groups in the healthcare ecosystem:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Users className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
                    <div>
                      <h3 className="mb-1 font-semibold">Patients</h3>
                      <p className="text-sm text-muted-foreground">
                        Control health data, access records anywhere, earn 60% revenue share
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 h-6 w-6 flex-shrink-0 text-green-600" />
                    <div>
                      <h3 className="mb-1 font-semibold">Hospitals</h3>
                      <p className="text-sm text-muted-foreground">
                        Monetize data, ensure compliance, earn 25% revenue share
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Brain className="mt-1 h-6 w-6 flex-shrink-0 text-purple-600" />
                    <div>
                      <h3 className="mb-1 font-semibold">AI & ML Companies</h3>
                      <p className="text-sm text-muted-foreground">
                        Access structured FHIR data for model training and predictive tools
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FlaskConical className="mt-1 h-6 w-6 flex-shrink-0 text-teal-600" />
                    <div>
                      <h3 className="mb-1 font-semibold">Pharmaceutical Companies</h3>
                      <p className="text-sm text-muted-foreground">
                        Clinical trial feasibility, real-world evidence, drug development
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-1 h-6 w-6 flex-shrink-0 text-orange-600" />
                    <div>
                      <h3 className="mb-1 font-semibold">Academic Researchers</h3>
                      <p className="text-sm text-muted-foreground">
                        Ethical data sourcing for clinical studies and population health research
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="mt-1 h-6 w-6 flex-shrink-0 text-pink-600" />
                    <div>
                      <h3 className="mb-1 font-semibold">NGOs & Non-Profits</h3>
                      <p className="text-sm text-muted-foreground">
                        Public health research, rare disease studies, population health analysis
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Built on Hedera Hashgraph, the world&apos;s most used enterprise-grade public
                  distributed ledger:
                </p>
                <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                  <li>Hedera Consensus Service (HCS) for immutable proof storage</li>
                  <li>Hedera EVM for smart contract execution</li>
                  <li>HBAR for instant micropayments</li>
                  <li>FHIR R4 compliant healthcare data processing</li>
                  <li>10,000+ TPS for real-time processing</li>
                  <li>Carbon-negative network</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

