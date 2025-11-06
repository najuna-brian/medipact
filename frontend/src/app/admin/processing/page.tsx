import AdapterDemo from '@/components/AdapterDemo/AdapterDemo';

export default function AdminProcessingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Adapter Processing</h1>
          <p className="text-muted-foreground">
            Process hospital EHR data and submit to Hedera HCS
          </p>
        </div>
        <AdapterDemo />
      </div>
    </div>
  );
}

