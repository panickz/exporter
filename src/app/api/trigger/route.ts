import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pdfExports } from '@/db/schema';
import { Client } from '@upstash/qstash';

const QSTASH_TOKEN = process.env.QSTASH_TOKEN!;
const VERCEL_URL = process.env.VERCEL_URL || 'http://localhost:3000';
const WEBHOOK_URL = `${VERCEL_URL}/api/process`;

export async function POST() {
  try {
    const sourceUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    const [pdfExport] = await db
      .insert(pdfExports)
      .values({
        status: 'pending',
        sourceUrl,
      })
      .returning();

    const qstash = new Client({
      token: QSTASH_TOKEN,
    });

    const response = await qstash.publishJSON({
      url: WEBHOOK_URL,
      body: JSON.stringify({
        exportId: pdfExport.id,
        sourceUrl,
      }),
    });

     console.log(response)

    if (!response) {
      throw new Error('Failed to queue job');
    }

    return NextResponse.json({
      success: true,
      exportId: pdfExport.id,
    });
  } catch (error) {
    console.error('Error triggering export:', error);
    return NextResponse.json({ error: 'Failed to trigger export' }, { status: 500 });
  }
}