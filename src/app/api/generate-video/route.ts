import { type NextRequest, NextResponse } from 'next/server';

const FREEPIK_API_KEY = process.env.FREEPIK_GENERATITVE_IMAGE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { videoPrompt, imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'image_url is required for video generation' 
      }, { status: 400 });
    }

    const body = {
      prompt: videoPrompt,
      image: imageUrl,
      //resolution: '1080p',
      duration: "5",
      negative_prompt: '',
     // style: 'anime', 
      //seed: Math.floor(Math.random() * 1000000)
       cfg_scale: 0.5
    };

    const response = await fetch('https://api.freepik.com/v1/ai/image-to-video/kling-v2-5-pro', {
      method: 'POST',
      headers: new Headers({
        'x-freepik-api-key': FREEPIK_API_KEY ?? '',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Freepik kling 2.5 API error: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({ 
      task_id: result.data.task_id, 
      status: result.data.status 
    });
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json({ error: 'Error generating video' }, { status: 500 });
  }
}