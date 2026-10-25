import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    return parseInt(process.env.PORT, 10);
  }
  // Default to 3001 so it runs side-by-side with multibloques (3000)
  return 3001;
}

const port = getPort();

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

const host = getHost();

app.use(express.json());

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const VOICE_MAP_GEMINI: Record<string, string> = {
  '35b2cfc1-e6fb-4d69-a598-c1780612be4a': 'Puck', // Darío
  'a7beff01-8f8b-4809-bfe6-e2166e57e0c2': 'Aoede', // Iria
  'ad38904c-0ce9-42b1-9159-5ad5352ef089': 'Kore', // Celia
};

function normalizeSpeechText(text: string): string {
  return text
    .replace(/90°/g, 'noventa grados')
    .replace(/(\d+)°/g, '$1 grados')
    .replace(/\b3D\b/gi, 'tres de')
    .replace(/\b3\.º\b/gi, 'tercero')
    .replace(/(\d+)\s*[x×*]\s*(\d+)/gi, '$1 por $2')
    .replace(/(\d+)\s*=\s*(\d+)/g, '$1 es igual a $2');
}

async function synthesizeWithGemini(
  text: string,
  voiceId?: string,
  customApiKey?: string
): Promise<{ buffer: Buffer; contentType: string; isQuota?: boolean } | null> {
  const apiKey = customApiKey || GEMINI_API_KEY;
  if (!apiKey) return null;

  const geminiVoice = VOICE_MAP_GEMINI[voiceId || ''] || 'Puck';
  const cleanText = normalizeSpeechText(text);

  const modelsToTry = [
    'gemini-2.5-flash-preview-tts',
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-flash-tts',
  ];

  let anyQuotaExceeded = false;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: cleanText }],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: geminiVoice,
                },
              },
            },
          },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          anyQuotaExceeded = true;
        }
        continue;
      }

      const json = (await res.json()) as any;
      const base64Data = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Data) {
        continue;
      }

      const buffer = Buffer.from(base64Data, 'base64');
      return {
        buffer,
        contentType: 'audio/wav',
        isQuota: false,
      };
    } catch {
      continue;
    }
  }

  return anyQuotaExceeded ? { buffer: Buffer.alloc(0), contentType: '', isQuota: true } : null;
}

async function synthesizeWithCartesia(
  text: string,
  voiceId?: string,
  customApiKey?: string
): Promise<{ buffer: Buffer; contentType: string; isQuota: boolean } | null> {
  const apiKey = customApiKey || CARTESIA_API_KEY;
  if (!apiKey) return null;

  const selectedVoice = voiceId || '35b2cfc1-e6fb-4d69-a598-c1780612be4a';
  const cleanText = normalizeSpeechText(text);

  try {
    const cartesiaRes = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Cartesia-Version': '2024-06-10',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-3.6',
        transcript: cleanText,
        voice: {
          mode: 'id',
          id: selectedVoice,
        },
        output_format: {
          container: 'mp3',
          encoding: 'mp3',
          sample_rate: 44100,
        },
        language: 'es',
      }),
    });

    if (!cartesiaRes.ok) {
      const isQuota = cartesiaRes.status === 402 || cartesiaRes.status === 429;
      return { buffer: Buffer.alloc(0), contentType: '', isQuota };
    }

    const audioBuffer = await cartesiaRes.arrayBuffer();
    return {
      buffer: Buffer.from(audioBuffer),
      contentType: 'audio/mpeg',
      isQuota: false,
    };
  } catch {
    return null;
  }
}

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId, engine } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const customGeminiKey = (req.headers['x-gemini-key'] as string) || undefined;
    const requestedEngine = engine || 'auto';

    if (requestedEngine === 'gemini') {
      const geminiResult = await synthesizeWithGemini(text, voiceId, customGeminiKey);
      if (geminiResult && geminiResult.buffer.length > 0) {
        res.setHeader('Content-Type', geminiResult.contentType);
        res.setHeader('X-TTS-Engine', 'gemini');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(geminiResult.buffer);
      }
      if (geminiResult?.isQuota) {
        return res.status(429).json({
          error: 'Google AI Studio quota exceeded',
          code: 'GEMINI_QUOTA_EXHAUSTED',
        });
      }
      const cartesiaFallback = await synthesizeWithCartesia(text, voiceId);
      if (cartesiaFallback && cartesiaFallback.buffer.length > 0) {
        res.setHeader('Content-Type', cartesiaFallback.contentType);
        res.setHeader('X-TTS-Engine', 'cartesia');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cartesiaFallback.buffer);
      }
    }

    if (requestedEngine === 'cartesia' || requestedEngine === 'auto') {
      const cartesiaResult = await synthesizeWithCartesia(text, voiceId);
      if (cartesiaResult && cartesiaResult.buffer.length > 0) {
        res.setHeader('Content-Type', cartesiaResult.contentType);
        res.setHeader('X-TTS-Engine', 'cartesia');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(cartesiaResult.buffer);
      }

      const geminiFallback = await synthesizeWithGemini(text, voiceId, customGeminiKey);
      if (geminiFallback && geminiFallback.buffer.length > 0) {
        res.setHeader('Content-Type', geminiFallback.contentType);
        res.setHeader('X-TTS-Engine', 'gemini');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(geminiFallback.buffer);
      }

      if (geminiFallback?.isQuota) {
        return res.status(429).json({
          error: 'All cloud AI quotas exhausted',
          code: 'ALL_QUOTAS_EXHAUSTED',
        });
      }
    }

    return res.status(503).json({
      error: 'TTS synthesis unavailable on cloud providers',
      code: 'FALLBACK_TO_BROWSER',
    });
  } catch (error: any) {
    console.error('TTS Proxy error:', error);
    res.status(500).json({ error: 'Internal server error', message: error?.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(port, host, () => {
    console.log(`\n  MultiÁngulos 3D v1.0.0 ready\n`);
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://${host}:${port}/`);
  });

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });
}

startServer();
