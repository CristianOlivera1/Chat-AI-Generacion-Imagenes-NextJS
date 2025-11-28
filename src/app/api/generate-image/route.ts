import { type NextRequest, NextResponse } from 'next/server';

const FREEPIK_API_KEY = process.env.FREEPIK_GENERATITVE_IMAGE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { imagePrompt } = await request.json();

    const body = {
      prompt: imagePrompt,
      resolution: '2k',
      aspect_ratio: 'square_1_1',
      model: 'realism',
      engine: 'automatic',
      filter_nsfw: true
    };

    const response = await fetch('https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview', {
      method: 'POST',
      headers: new Headers({
        'x-freepik-api-key': FREEPIK_API_KEY ?? '',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freepik gemini-2-5-flash-image-preview API error: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({ task_id: result.data.task_id, status: result.data.status });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
  }
}