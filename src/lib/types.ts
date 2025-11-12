export interface GameMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: GeneratedImage;
  imageLoading?: boolean;
}

export interface GeneratedImage {
  base64Data?: string;
  mediaType?: string;
  uint8ArrayData?: Uint8Array;
  url?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string
}

export type GameMode = 'chat' | 'imagen';

export interface GenerateStoryRequest {
  userMessage: string;
  conversationHistory: ConversationMessage[];
  isStart: boolean;
  mode?: GameMode;
}

export interface GenerateImageRequest {
  imagePrompt: string;
}

export interface GenerateStoryResponse {
  narrative: string;
  imagePrompt: string;
}