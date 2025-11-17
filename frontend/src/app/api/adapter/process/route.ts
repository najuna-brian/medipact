import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const hospitalId = formData.get('hospitalId') as string | null;
    const hospitalCountry = formData.get('hospitalCountry') as string | null;
    const hospitalLocation = formData.get('hospitalLocation') as string | null;
    const apiKey = formData.get('apiKey') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!hospitalCountry) {
      return NextResponse.json(
        { error: 'Hospital country is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 8080}`;
    
    // Create a new FormData to forward to backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    if (hospitalId) backendFormData.append('hospitalId', hospitalId);
    if (hospitalCountry) backendFormData.append('hospitalCountry', hospitalCountry);
    if (hospitalLocation) backendFormData.append('hospitalLocation', hospitalLocation);
    if (apiKey) backendFormData.append('apiKey', apiKey);

    try {
      const response = await fetch(`${backendUrl}/api/hospital/upload-csv`, {
        method: 'POST',
        body: backendFormData,
        headers: {
          // Forward authentication headers if needed
          ...(apiKey && { 'X-API-Key': apiKey }),
          ...(hospitalId && { 'X-Hospital-ID': hospitalId }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { 
            error: data.error || 'Processing failed',
            details: data.details || data.message
          },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (error: any) {
      console.error('Backend forwarding error:', error);
      return NextResponse.json(
        {
          error: 'Failed to connect to backend',
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
