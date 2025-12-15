import { type NextRequest, NextResponse } from 'next/server';

const FREEPIK_API_KEY = process.env.FREEPIK_GENERATITVE_IMAGE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 });
    }

    const response = await fetch(`https://api.freepik.com/v1/ai/image-to-video/kling-v2-5-pro/${taskId}`, {
      method: 'GET',
      headers: new Headers({
        'x-freepik-api-key': FREEPIK_API_KEY ?? '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freepik kling 2.5 status API error: ${errorText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      task_id: result.data.task_id,
      status: result.data.status,
      generated: result.data.generated || []
    });
  } catch (error) {
    console.error('Error getting kling 2.5 status:', error);
    return NextResponse.json({ error: 'Error getting video status' }, { status: 500 });
  }
}