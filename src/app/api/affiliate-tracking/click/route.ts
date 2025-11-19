import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Add client IP and additional headers
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const trackingData = {
      ...body,
      ip_address: clientIP,
      headers: {
        'user-agent': request.headers.get('user-agent') || '',
        'referer': request.headers.get('referer') || '',
        'accept-language': request.headers.get('accept-language') || '',
      }
    }

    const response = await fetch(`${BACKEND_URL}/affiliate-tracking/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
