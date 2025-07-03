import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pdfExports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateDownloadToken, createExpiryDate } from '@/tokens/tokens';

export async function POST(request: NextRequest) {
  let exportId: number | undefined;

  try {
    const rawBody = await request.json();
    console.log('Raw body received:', rawBody);

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse JSON from raw body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }

    exportId = body.exportId;

    console.log('Parsed body object:', body);
    console.log('Extracted exportId:', exportId);

    if (typeof exportId !== 'number' || isNaN(exportId)) {
      console.error('Invalid or missing exportId in request body after parsing:', exportId);
      return NextResponse.json({ error: 'Missing or invalid exportId' }, { status: 400 });
    }

    const processingRsp = await db.update(pdfExports).set({ status: 'processing' }).where(eq(pdfExports.id, exportId));
    console.log('Processing update response:', processingRsp);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const downloadToken = generateDownloadToken();
    const expiresAt = createExpiryDate();

    const rsp = await db
      .update(pdfExports)
      .set({
        status: 'completed',
        downloadToken,
        completedAt: new Date(),
        expiresAt,
      })
      .where(eq(pdfExports.id, exportId));

    console.log('Final update response:', rsp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing export:', error);

    if (typeof exportId === 'number' && !isNaN(exportId)) {
      await db.update(pdfExports).set({ status: 'failed' }).where(eq(pdfExports.id, exportId));
    } else {
        const failedRawBody = await request.text().catch(() => 'N/A'); // Re-read raw text for logging
        console.error('Could not extract exportId for failure update. Original failed raw body:', failedRawBody);
    }

    return NextResponse.json({ error: 'Failed to process export' }, { status: 500 });
  }
}