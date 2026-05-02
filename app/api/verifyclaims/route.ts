// app/api/verifyclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJson } from '@/lib/gemini';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { claim, original_text, exasources } = await req.json();

    if (!claim || !original_text || !exasources) {
      return NextResponse.json({ error: 'Claim and sources are required' }, { status: 400 });
    }

    const factCheckSchema = z.object({
      claim: z.string(),
      assessment: z.enum(["True", "False", "Insufficient Information", "Unverified"]),
      summary: z.string(),
      fixed_original_text: z.string(),
      confidence_score: z.number().min(0).max(100)
    });

    const object = factCheckSchema.parse(
      await generateGeminiJson(
        `You are an expert fact-checker. Given a claim and a set of sources, determine whether the claim is true or false based on the text from sources (or if there is insufficient information).
    
      For your analysis, consider all the sources collectively.

      Here are the sources:
      ${exasources.map((source: any, index: number) => `Source ${index + 1}:
      Text: ${source.text}
      URL: ${source.url}
      `).join('\n')}

      Here is the Original part of the text: ${original_text}

      Here is the claim: ${claim}

      Provide your answer as a JSON object with the following structure:

      claim: "...",
      assessment: "True" or "False" or "Insufficient Information" or "Unverified",
      summary: "Why is this claim correct and if it isn't correct, then what's correct. In a single line.",
      fixed_original_text: "If the assessment is False then correct the original text (keeping everything as it is and just fix the fact in the part of the text)",
      confidence_score: a percentage number between 0 and 100 (100 means fully confident that the decision you have made is correct, 0 means you are completely unsure),
      
      `
      )
    );

    console.log('LLM response:', object);
    
    return NextResponse.json({ claims: object });
  } catch (error) {
    console.error('Verify claims API error:', error);
    return NextResponse.json({ error: `Failed to extract claims | ${error}` }, { status: 500 });
  }
}
