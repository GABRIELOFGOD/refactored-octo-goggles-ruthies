import { NextRequest, NextResponse } from 'next/server';

interface LibreTranslateResponse {
  translatedText?: string | string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  const serviceUrl = process.env.LIBRETRANSLATE_URL;
  if (!serviceUrl) {
    return NextResponse.json(
      { error: 'Translation service is not configured' },
      { status: 503 }
    );
  }

  let body: { target?: unknown; texts?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    (body.target !== 'en' && body.target !== 'fr') ||
    !Array.isArray(body.texts) ||
    body.texts.length === 0 ||
    body.texts.length > 100 ||
    body.texts.some(
      (text) => typeof text !== 'string' || text.length === 0 || text.length > 1000
    )
  ) {
    return NextResponse.json(
      { error: 'Expected up to 100 non-empty texts and a supported target language' },
      { status: 400 }
    );
  }

  if (body.target === 'en') {
    return NextResponse.json({ translations: body.texts });
  }

  try {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const apiKey = process.env.LIBRETRANSLATE_API_KEY;
    const response = await fetch(`${serviceUrl.replace(/\/+$/, '')}/translate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        q: body.texts,
        source: 'en',
        target: body.target,
        format: 'text',
        ...(apiKey ? { api_key: apiKey } : {}),
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`LibreTranslate request failed with status ${response.status}`);
      return NextResponse.json(
        { error: 'Translation service request failed' },
        { status: 502 }
      );
    }

    const result = (await response.json()) as LibreTranslateResponse;
    const translations =
      typeof result.translatedText === 'string'
        ? [result.translatedText]
        : result.translatedText;

    if (
      !Array.isArray(translations) ||
      translations.length !== body.texts.length ||
      translations.some((translation) => typeof translation !== 'string')
    ) {
      console.error('LibreTranslate returned an invalid translation response');
      return NextResponse.json(
        { error: 'Translation service returned an invalid response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('LibreTranslate request failed:', error);
    return NextResponse.json(
      { error: 'Unable to reach translation service' },
      { status: 502 }
    );
  }
}
