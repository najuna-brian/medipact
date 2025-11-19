'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Code,
  CreditCard,
  Wallet,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Key,
  Coins,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { ResearcherSidebar } from '@/components/Sidebar/ResearcherSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ResearcherAPIAccessPage() {
  const router = useRouter();
  const [researcherId, setResearcherId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('researcherId');
    if (id) {
      setResearcherId(id);
    } else {
      router.push('/researcher/register');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ResearcherSidebar />
      <div className="md:ml-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Code className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold">API Access & Billing</h1>
              <Badge variant="info" className="ml-2">
                Coming Soon
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Programmatic access to anonymized medical data with flexible billing options
            </p>
          </div>

          {/* Coming Soon Alert */}
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Future Feature:</strong> This feature is planned for post-hackathon implementation. 
              The API infrastructure is ready, and billing will be integrated soon.
            </AlertDescription>
          </Alert>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    How Pay-Per-Query API Works
                  </CardTitle>
                  <CardDescription>
                    Access patient records programmatically with automatic billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Make API Request</h4>
                        <p className="text-sm text-muted-foreground">
                          Query patient data using our REST API with filters (country, disease, demographics, etc.)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Automatic Billing</h4>
                        <p className="text-sm text-muted-foreground">
                          System calculates charge: <strong>0.1 HBAR per patient record</strong> (minimum 1 HBAR)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Instant Access</h4>
                        <p className="text-sm text-muted-foreground">
                          If payment succeeds, data is returned immediately. Revenue automatically distributed (60/25/15)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Billing Options
                  </CardTitle>
                  <CardDescription>
                    Choose the billing method that works best for your research needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="prepaid" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="prepaid">Prepaid Credits</TabsTrigger>
                      <TabsTrigger value="postpaid">Postpaid Billing</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="prepaid" className="space-y-4 mt-4">
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-start gap-3">
                          <Coins className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-900 mb-1">Prepaid Credits</h4>
                            <p className="text-sm text-green-800 mb-3">
                              Load credits upfront and use them as you query. Perfect for predictable research budgets.
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>No payment delays - instant API access</span>
                              </div>
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Set spending limits and budgets</span>
                              </div>
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Automatic top-up when credits run low</span>
                              </div>
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Volume discounts available</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Example Usage</h5>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>• Load 100 HBAR credits = 1,000 patient records</p>
                          <p>• Query returns 20 patients = 2 HBAR deducted</p>
                          <p>• Remaining balance: 98 HBAR</p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="postpaid" className="space-y-4 mt-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Postpaid Billing</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Pay at the end of each billing cycle. Ideal for high-volume research with flexible budgets.
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-blue-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Query first, pay later (monthly billing)</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Detailed usage reports and analytics</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Automatic invoice generation</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-800">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Credit limits and approval workflows</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Example Usage</h5>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>• Query 500 patients this month = 50 HBAR</p>
                          <p>• Query 300 patients next month = 30 HBAR</p>
                          <p>• Monthly invoice: 80 HBAR total</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* API Endpoints Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-purple-600" />
                    Available API Endpoints
                  </CardTitle>
                  <CardDescription>
                    RESTful endpoints for programmatic data access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono font-semibold">GET /api/researcher/patients</code>
                        <Badge variant="default">0.1 HBAR/record</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Query patient records with filters (country, age, gender, date range)
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono font-semibold">GET /api/researcher/conditions</code>
                        <Badge variant="default">0.1 HBAR/record</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Query medical conditions by ICD-10 code, name, or diagnosis date
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono font-semibold">GET /api/researcher/observations</code>
                        <Badge variant="default">0.1 HBAR/record</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Query lab results and observations by test name, code, or value range
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono font-semibold">GET /api/researcher/encounters</code>
                        <Badge variant="default">0.1 HBAR/record</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Query healthcare encounters by type, class, or date range
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">0.1 HBAR</div>
                    <div className="text-sm text-muted-foreground">per patient record</div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum charge:</span>
                        <span className="font-semibold">1 HBAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">≈ USD per record:</span>
                        <span className="font-semibold">$0.016</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-800">
                      <strong>Example:</strong> Query returning 20 patients = 2.0 HBAR (~$0.32 USD)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-purple-600" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-semibold">Get API Key</p>
                        <p className="text-muted-foreground text-xs">
                          Create an API key from your researcher dashboard
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-semibold">Choose Billing</p>
                        <p className="text-muted-foreground text-xs">
                          Select prepaid credits or postpaid billing
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-semibold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-semibold">Start Querying</p>
                        <p className="text-muted-foreground text-xs">
                          Make API requests with automatic billing
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" disabled>
                    <Code className="h-4 w-4 mr-2" />
                    View API Documentation
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Pay only for records you access</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Automatic revenue distribution</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Real-time usage tracking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Rate limiting and security</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>FHIR R4 compliant responses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

