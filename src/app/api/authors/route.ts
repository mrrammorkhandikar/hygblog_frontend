import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('Fetching authors from:', `${baseUrl}/authors/published`);

    const response = await fetch(`${baseUrl}/authors/published`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const authors = await response.json();
    console.log('Fetched authors:', authors.length);
    return NextResponse.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
