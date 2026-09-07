// Avatar generation runs server-side (see api/generate-avatar.ts). The Gemini
// API key is never exposed to the browser.

export const generatePlayerAvatar = async (
  playerName: string,
  description: string,
): Promise<string> => {
  const res = await fetch('/api/generate-avatar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, description }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Avatar request failed (${res.status})`);
  }

  const { image } = (await res.json()) as { image?: string };
  if (!image) {
    throw new Error('No image returned');
  }
  return image;
};
