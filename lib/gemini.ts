const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const MAX_RETRIES = 5;

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function normalizeJsonText(text: string) {
  const trimmed = text.trim();
  const fencedJson = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fencedJson ? fencedJson[1].trim() : trimmed;
}

/**
 * Extract the "retry after" duration (in ms) from a Gemini error message.
 * The API returns strings like "Please retry in 41.892639852s."
 * Falls back to an exponential backoff if parsing fails.
 */
function getRetryDelay(errorMessage: string | undefined, attempt: number): number {
  if (errorMessage) {
    const match = errorMessage.match(/retry in ([\d.]+)s/i);
    if (match) {
      // Add 2 extra seconds of buffer so we don't land right on the edge
      return (parseFloat(match[1]) + 2) * 1000;
    }
  }
  // Exponential backoff: 10s, 20s, 40s, 80s, 160s
  return Math.min(10000 * Math.pow(2, attempt), 160000);
}

export async function generateGeminiJson<T>(prompt: string): Promise<T> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    const data = (await response.json().catch(() => ({}))) as GeminiGenerateContentResponse;

    // If rate-limited (HTTP 429 or 503), wait and retry automatically
    if (response.status === 429 || response.status === 503) {
      if (attempt < MAX_RETRIES) {
        const delay = getRetryDelay(data.error?.message, attempt);
        console.log(`Rate limited. Waiting ${Math.round(delay / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw new Error('Gemini API rate limit: max retries exceeded. Please wait a minute and try again.');
    }

    if (!response.ok) {
      throw new Error(data.error?.message ?? response.statusText);
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini returned no content');
    }

    return JSON.parse(normalizeJsonText(text)) as T;
  }

  throw new Error('Gemini API: unexpected retry loop exit');
}
