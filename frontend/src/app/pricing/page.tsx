import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Per Dataset',
      price: '50',
      currency: 'HBAR',
      description: 'One-time purchase for individual datasets',
      features: [
        'Full dataset access',
        'CSV and FHIR formats',
        'Dataset metadata',
        'Verification proofs',
        'Research license',
      ],
    },
    {
      name: 'Bulk Purchase',
      price: '400',
      currency: 'HBAR',
      description: '10 datasets bundle (20% discount)',
      features: [
        '10 datasets of your choice',
        'All formats included',
        'Priority support',
        'Extended research license',
        'Volume discount',
      ],
      popular: true,
    },
    {
      name: 'Subscription',
      price: '200',
      currency: 'HBAR/month',
      description: 'Monthly access to catalog',
      features: [
        'Unlimited dataset access',
        'New datasets automatically',
        'Priority support',
        'Advanced analytics',
        'Custom data requests',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Transparent pricing for research data access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.popular ? 'border-2 border-primary' : ''}
            >
              {tier.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2">
                  <Badge variant="default">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground ml-2">{tier.currency}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Revenue Split</CardTitle>
            <CardDescription>How revenue is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-900">60%</p>
                <p className="text-sm text-green-800">Patient</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">25%</p>
                <p className="text-sm text-blue-800">Hospital</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-900">15%</p>
                <p className="text-sm text-purple-800">MediPact</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

