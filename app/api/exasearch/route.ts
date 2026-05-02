// app/api/exasearch/route.ts
import { NextRequest, NextResponse } from 'next/server';

type ExaSearchResult = {
  text?: string;
  url: string;
};

export async function POST(req: NextRequest) {
  try {
    const { claim } = await req.json();
    if (!claim) {
      return NextResponse.json({ error: 'Claim is required' }, { status: 400 });
    }

    const exaApiKey = process.env.EXA_API_KEY;
    if (!exaApiKey) {
      return NextResponse.json({ error: 'EXA_API_KEY is not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': exaApiKey,
      },
      body: JSON.stringify({
        query: `${claim} \n\nHere is a web page to help verify this content:`,
        type: 'auto',
        numResults: 3,
        contents: {
          text: {
            maxCharacters: 4000,
          },
          maxAgeHours: 0,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.error ?? errorBody?.message ?? response.statusText;
      return NextResponse.json(
        { error: `Failed to perform search | ${message}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Extract only url and text from each result and reverse the order
    const simplifiedResults = result.results.map((item: ExaSearchResult) => ({
      text: item.text,
      url: item.url
    })).reverse();

    return NextResponse.json({ results: simplifiedResults });
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}
