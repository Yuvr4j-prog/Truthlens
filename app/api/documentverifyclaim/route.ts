import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateGeminiJson } from '@/lib/gemini';

const requestSchema = z.object({
  claim: z.string().min(1),
  documentText: z.string().min(1)
});

const geminiResponseSchema = z.object({
  verdict: z.any().transform(v => {
    const lower = String(v || '').toLowerCase();
    if (lower.includes('true') || lower.includes('supported')) return 'True';
    if (lower.includes('false') || lower.includes('refuted')) return 'False';
    return 'Insufficient Information';
  }),
  confidence_score: z.any().transform(v => {
    const num = parseFloat(String(v));
    return isNaN(num) ? 0 : (num > 1 ? num / 100 : num);
  }),
  summary: z.any().transform(v => String(v || "No summary provided.")),
  relevant_excerpt: z.any().transform(v => String(v || ""))
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }
    
    const { claim, documentText } = result.data;
    
    const prompt = `You are a fact-checking assistant. Based ONLY on the document text provided below, verify the following claim. Do not use any external knowledge outside of the document. Document: ${documentText} Claim: ${claim} Return ONLY a valid JSON object with exactly these fields: verdict (one of exactly True, False, Insufficient Information), confidence_score (a number between 0 and 1), summary (a brief explanation of why based on the document), relevant_excerpt (the exact portion of the document that supports your verdict)`;
    
    const geminiData = await generateGeminiJson(prompt);
    console.log("Raw Gemini Output:", JSON.stringify(geminiData));
    
    const parsedData = geminiResponseSchema.safeParse(geminiData);
    
    if (!parsedData.success) {
      console.error("Zod Parsing Error:", parsedData.error);
      return NextResponse.json({ error: 'Invalid response from Gemini', details: parsedData.error }, { status: 500 });
    }
    
    return NextResponse.json(parsedData.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
