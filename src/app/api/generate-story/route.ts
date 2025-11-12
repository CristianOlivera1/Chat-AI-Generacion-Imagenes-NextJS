import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import { type NextRequest, NextResponse } from 'next/server';

import { GAME_PROMPTS } from '@/lib/prompts'
import { GAME_CONFIG } from '@/lib/consts'
import { GenerateStoryRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory, isStart, mode = 'chat' }: GenerateStoryRequest = await request.json();

    let prompt: string;

    if (isStart) {
      prompt = mode === 'chat' ? GAME_PROMPTS.INITIAL_CHAT : GAME_PROMPTS.INITIAL_IMAGE;
    } else {
      const historyText = conversationHistory.map(
        (message) => `${message.role}: ${message.content}`
      ).join('\n');

      prompt = mode === 'chat' 
        ? GAME_PROMPTS.CONTINUE_CHAT(historyText, userMessage)
        : GAME_PROMPTS.CONTINUE_IMAGE(historyText, userMessage);
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      prompt
    })

    let narrative: string;
    let imagePrompt: string = '';

    if (mode === 'imagen') {
      const parts = text.split(GAME_CONFIG.IMAGE.SEPARATOR);
      narrative = parts[0];
      imagePrompt = parts[1] || '';
    } else {
      narrative = text;
    }

    return NextResponse.json({ narrative, imagePrompt });
    
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json({ error: 'Error generating story' }, { status: 500 });
  }
}