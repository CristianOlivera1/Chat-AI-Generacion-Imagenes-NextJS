export interface GameMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: GeneratedImage;
  imageLoading?: boolean;
  video?: GeneratedVideo;
  videoLoading?: boolean;
  uploadedImageUrl?: string;
}

export interface GeneratedImage {
  base64Data?: string;
  mediaType?: string;
  uint8ArrayData?: Uint8Array;
  url?: string;
}

export interface GeneratedVideo {
  url?: string;
  taskId?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string
}

export type GameMode = 'chat' | 'imagen' | 'video';

export interface GenerateStoryRequest {
  userMessage: string;
  conversationHistory: ConversationMessage[];
  isStart: boolean;
  mode?: GameMode;
}

export interface GenerateImageRequest {
  imagePrompt: string;
}

export interface GenerateVideoRequest {
  videoPrompt: string;
  imageUrl?: string;
}

export interface GenerateStoryResponse {
  narrative: string;
  imagePrompt: string;
  videoPrompt?: string;
}