import { type NextRequest, NextResponse } from 'next/server';

const FREEPIK_API_KEY = process.env.FREEPIK_GENERATITVE_IMAGE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview/${taskId}`, {
      method: 'GET',
      headers: new Headers({
        'x-freepik-api-key': FREEPIK_API_KEY ?? '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freepik gemini-2-5-flash-image-preview status API error: ${errorText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      task_id: result.data.task_id,
      status: result.data.status,
      generated: result.data.generated || []
    });
  } catch (error) {
    console.error('Error getting gemini-2-5-flash-image-preview status:', error);
    return NextResponse.json({ error: 'Error getting image status' }, { status: 500 });
  }
}