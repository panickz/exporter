import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pdfExports } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

type Params = Promise<{ token: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { token } = await params;

    const [pdfExport] = await db
      .select()
      .from(pdfExports)
      .where(and(eq(pdfExports.downloadToken, token), eq(pdfExports.status, 'completed')))
      .limit(1);

    if (!pdfExport) {
      return NextResponse.json({ error: 'Invalid or expired download link' }, { status: 404 });
    }

    if (pdfExport.expiresAt && new Date() > pdfExport.expiresAt) {
      return NextResponse.json({ error: 'Download link has expired' }, { status: 410 });
    }

    const pdfResponse = await fetch(pdfExport.sourceUrl);

    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF');
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="export-${pdfExport.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return NextResponse.json({ error: 'Failed to download PDF' }, { status: 500 });
  }
}
