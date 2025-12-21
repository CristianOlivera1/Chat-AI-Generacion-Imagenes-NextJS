import { supabase } from './client'
import type { GameMessage, GameMode } from '@/lib/types'

export interface Conversation {
  id: string
  user_id: string
  title: string
  mode: 'chat' | 'imagen' | 'video'
  started_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'user' | 'ai'
  content: string
  created_at: string
}

export interface GeneratedImage {
  id: string
  conversation_id: string
  prompt: string
  image_url: string
  created_at: string
}

export interface GeneratedVideo {
  id: string
  conversation_id: string
  prompt: string
  image_url: string
  video_url: string
  created_at: string
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  return data || []
}

export async function createConversation(
  userId: string,
  mode: 'chat' | 'imagen' | 'video',
  title: string = 'Nueva conversación'
): Promise<string | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      mode,
      title
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }

  return data?.id || null
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)

  if (error) {
    console.error('Error updating conversation title:', error)
    return false
  }

  return true
}

export async function saveMessage(
  conversationId: string,
  sender: 'user' | 'ai',
  content: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender,
      content
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return null
  }

  return data?.id || null
}

export async function saveGeneratedImage(
  conversationId: string,
  prompt: string,
  imageUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from('generated_images')
    .insert({
      conversation_id: conversationId,
      prompt,
      image_url: imageUrl
    })

  if (error) {
    console.error('Error saving generated image:', error)
    return false
  }

  return true
}

export async function saveGeneratedVideo(
  conversationId: string,
  prompt: string,
  imageUrl: string,
  videoUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from('generated_videos')
    .insert({
      conversation_id: conversationId,
      prompt,
      image_url: imageUrl,
      video_url: videoUrl
    })

  if (error) {
    console.error('Error saving generated video:', error)
    return false
  }

  return true
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('Error deleting conversation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteConversation:', error)
    return false
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export async function getConversationImages(
  conversationId: string
): Promise<GeneratedImage[]> {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching images:', error)
    return []
  }

  return data || []
}

export async function getConversationVideos(
  conversationId: string
): Promise<GeneratedVideo[]> {
  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }

  return data || []
}

export async function loadFullConversation(
  conversationId: string,
  mode: 'chat' | 'imagen' | 'video'
): Promise<GameMessage[]> {
  const messages = await getConversationMessages(conversationId)
  const gameMessages: GameMessage[] = []

  if (mode === 'imagen') {
    const images = await getConversationImages(conversationId)
    let imageIndex = 0

    for (const msg of messages) {
      if (msg.sender === 'user') {
        gameMessages.push({
          id: msg.id,
          role: 'user',
          content: msg.content
        })
      } else {
        const image = images[imageIndex]
        gameMessages.push({
          id: msg.id,
          role: 'assistant',
          content: msg.content,
          image: image ? { url: image.image_url } : undefined
        })
        if (image) imageIndex++
      }
    }
  } else if (mode === 'video') {
    const videos = await getConversationVideos(conversationId)
    let videoIndex = 0

    for (const msg of messages) {
      if (msg.sender === 'user') {
        const video = videos[videoIndex]
        gameMessages.push({
          id: msg.id,
          role: 'user',
          content: msg.content,
          uploadedImageUrl: video?.image_url 
        })
      } else {
        const video = videos[videoIndex]
        gameMessages.push({
          id: msg.id,
          role: 'assistant',
          content: msg.content,
          video: video ? { url: video.video_url } : undefined
        })
        if (video) videoIndex++
      }
    }
  } else {
    for (const msg of messages) {
      gameMessages.push({
        id: msg.id,
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    }
  }

  return gameMessages
}
