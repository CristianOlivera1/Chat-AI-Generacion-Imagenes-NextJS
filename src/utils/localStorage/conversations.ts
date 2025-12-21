import type { GameMessage } from '@/lib/types'

export interface LocalConversation {
  id: string
  title: string
  mode: 'chat' | 'imagen' | 'video'
  started_at: string
  messages: GameMessage[]
}

const STORAGE_KEY = 'chat_conversations'

export function getLocalConversations(): LocalConversation[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error)
    return []
  }
}

function saveLocalConversations(conversations: LocalConversation[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch (error) {
    console.error('Error saving conversations to localStorage:', error)
  }
}

export function createLocalConversation(
  mode: 'chat' | 'imagen' | 'video',
  title: string = 'Nueva conversación'
): string {
  const conversations = getLocalConversations()
  
  const newConversation: LocalConversation = {
    id: crypto.randomUUID(),
    title,
    mode,
    started_at: new Date().toISOString(),
    messages: []
  }
  
  conversations.unshift(newConversation)
  saveLocalConversations(conversations)
  
  return newConversation.id
}

export function getLocalConversation(conversationId: string): LocalConversation | null {
  const conversations = getLocalConversations()
  return conversations.find(c => c.id === conversationId) || null
}

export function updateLocalConversationTitle(conversationId: string, title: string): boolean {
  const conversations = getLocalConversations()
  const conversation = conversations.find(c => c.id === conversationId)
  
  if (conversation) {
    conversation.title = title
    saveLocalConversations(conversations)
    return true
  }
  
  return false
}

export function addMessageToLocalConversation(
  conversationId: string,
  message: GameMessage
): boolean {
  const conversations = getLocalConversations()
  const conversation = conversations.find(c => c.id === conversationId)
  
  if (conversation) {
    conversation.messages.push(message)
    saveLocalConversations(conversations)
    return true
  }
  
  return false
}

export function updateLocalConversationMessage(
  conversationId: string,
  messageId: string,
  updates: Partial<GameMessage>
): boolean {
  const conversations = getLocalConversations()
  const conversation = conversations.find(c => c.id === conversationId)
  
  if (conversation) {
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = {
        ...conversation.messages[messageIndex],
        ...updates
      }
      saveLocalConversations(conversations)
      return true
    }
  }
  
  return false
}

export function deleteLocalConversation(conversationId: string): boolean {
  const conversations = getLocalConversations()
  const filtered = conversations.filter(c => c.id !== conversationId)
  
  if (filtered.length < conversations.length) {
    saveLocalConversations(filtered)
    return true
  }
  
  return false
}

export function clearAllLocalConversations(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
