import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
    const response = await fetch(`${BACKEND_URL}/affiliate-tracking/export/${linkId}?format=${format}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to export data' },
        { status: response.status }
      )
    }

    // Get the content type and filename from backend response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition')
    
    // Stream the response from backend
    const data = await response.arrayBuffer()
    
    const headers: Record<string, string> = {
      'Content-Type': contentType,
    }
    
    if (contentDisposition) {
      headers['Content-Disposition'] = contentDisposition
    } else {
      // Fallback filename
      const extension = format === 'csv' ? 'csv' : 'json'
      headers['Content-Disposition'] = `attachment; filename="affiliate_stats_${linkId}.${extension}"`
    }

    return new NextResponse(data, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error exporting affiliate data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
