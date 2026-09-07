import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Server-side proxy for Gemini image generation. The API key lives only in
// GEMINI_API_KEY (a server env var) and never reaches the browser bundle.

const MODEL = 'gemini-2.5-flash-image';

// Crude per-instance rate limit: enough to blunt scripted abuse, not a real
// quota. Serverless instances are short-lived, so this resets often.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

const rateLimited = (ip: string): boolean => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
};

// Only serve requests that originate from this deployment's own pages.
const sameOrigin = (req: VercelRequest): boolean => {
  const origin = req.headers.origin;
  if (!origin) return true; // non-CORS same-origin fetch sends no Origin header
  try {
    const host = new URL(origin).host;
    return host === req.headers.host || host.endsWith('.vercel.app') || host === 'localhost:3000';
  } catch {
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Server is not configured for avatar generation.' });
  }

  const { playerName, description } = (req.body ?? {}) as {
    playerName?: unknown;
    description?: unknown;
  };
  if (typeof playerName !== 'string' || !playerName.trim() || playerName.length > 100) {
    return res.status(400).json({ error: 'playerName is required.' });
  }
  const safeDesc =
    typeof description === 'string' ? description.slice(0, 300) : '';

  const prompt = `
        Photorealistic portrait of a football player named ${playerName}.
        Professional sports photography style.
        High detail, 8k resolution.
        Dramatic lighting, shallow depth of field.
        Character details: ${safeDesc || 'determined expression, wearing a professional football jersey'}.
        Blurred stadium background.
        `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: '1:1' } },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return res.status(200).json({
          image: `data:image/png;base64,${part.inlineData.data}`,
        });
      }
    }
    return res.status(502).json({ error: 'Model returned no image.' });
  } catch (err) {
    console.error('Avatar generation failed:', err);
    return res.status(502).json({ error: 'Avatar generation failed.' });
  }
}
