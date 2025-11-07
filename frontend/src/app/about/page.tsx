import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, DollarSign, Database, Activity } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">About MediPact</h1>
            <p className="text-xl text-muted-foreground">
              The Verifiable Health Pact. Built on Hedera.
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  MediPact is a verifiable medical data marketplace that empowers patients to
                  control and monetize their anonymized medical data for research. We solve the
                  patient data black market by creating a transparent, ethical platform using
                  Hedera's Consensus Service for immutable proof and HBAR for instant micropayments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>The Problem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Patients are Exploited</h3>
                  <p className="text-muted-foreground">
                    Medical data is a multi-billion dollar asset. Data brokers buy and sell patient
                    information without knowledge, consent, or compensation. Patients are the
                    product, not the partner.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Researchers are Blind</h3>
                  <p className="text-muted-foreground">
                    Pharmaceutical companies and AI labs need high-quality, diverse data to cure
                    diseases. They're forced to buy from untrusted brokers with no way to verify
                    if data is real, ethically sourced, or unaltered.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hospitals are Trapped</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Immutable Proof</h3>
                      <p className="text-sm text-muted-foreground">
                        Hedera Consensus Service creates immutable proof of consent and data
                        authenticity
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Fair Compensation</h3>
                      <p className="text-sm text-muted-foreground">
                        Patients receive 60% of revenue via HBAR micropayments automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Database className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Anonymized Data</h3>
                      <p className="text-sm text-muted-foreground">
                        PII is removed while preserving medical data for research purposes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Transparent</h3>
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
                <CardTitle>Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Built on Hedera Hashgraph, the world's most used enterprise-grade public
                  distributed ledger:
                </p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
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

