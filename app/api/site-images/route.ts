import { NextResponse } from 'next/server';
import { getSiteContent } from '../../../lib/airtable';

export async function GET() {
  try {
    const contentMap = await getSiteContent();

    return NextResponse.json(
      { content: contentMap },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (err: any) {
    console.error('Error fetching site content:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
