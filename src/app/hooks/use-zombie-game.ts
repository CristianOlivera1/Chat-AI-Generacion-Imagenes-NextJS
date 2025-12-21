import { useState } from 'react';
import type { GameMessage, GenerateStoryResponse, GameMode } from '@/lib/types';
import { 
  createConversation, 
  saveMessage, 
  saveGeneratedImage, 
  saveGeneratedVideo,
  loadFullConversation,
} from '@/utils/supabase/conversations';
import {
  createLocalConversation,
  addMessageToLocalConversation,
  updateLocalConversationMessage,
  getLocalConversation
} from '@/utils/localStorage/conversations';

export function useZombieGame(userId?: string) {
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>('chat')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)

  const startNewConversation = async (title?: string) => {
    const conversationTitle = title || generateTitle('Nueva conversación')
    
    if (userId) {
      // Usuario autenticado - usar Supabase
      const modeMap: Record<GameMode, 'chat' | 'imagen' | 'video'> = {
        'chat': 'chat',
        'imagen': 'imagen',
        'video': 'video'
      }
      const conversationId = await createConversation(userId, modeMap[gameMode], conversationTitle)
      setCurrentConversationId(conversationId)
      return conversationId
    } else {
      // Sin usuario - usar localStorage
      const modeMap: Record<GameMode, 'chat' | 'imagen' | 'video'> = {
        'chat': 'chat',
        'imagen': 'imagen',
        'video': 'video'
      }
      const conversationId = createLocalConversation(modeMap[gameMode], conversationTitle)
      setCurrentConversationId(conversationId)
      return conversationId
    }
  }

  const loadConversation = async (conversationId: string, mode: GameMode) => {
    if (currentConversationId === conversationId) return
    
    setIsLoading(true)
    setIsLoadingConversation(true)
    
    try {
      let loadedMessages: GameMessage[] = []
      
      if (userId) {
        // Usuario autenticado - cargar desde Supabase
        const modeMap: Record<GameMode, 'chat' | 'imagen' | 'video'> = {
          'chat': 'chat',
          'imagen': 'imagen',
          'video': 'video'
        }
        loadedMessages = await loadFullConversation(conversationId, modeMap[mode])
      } else {
        // Sin usuario - cargar desde localStorage
        const conversation = getLocalConversation(conversationId)
        if (conversation) {
          loadedMessages = conversation.messages
        }
      }
      
      setCurrentConversationId(conversationId)
      setGameMode(mode)
      setMessages(loadedMessages)
      setUploadedImage(null)
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingConversation(false)
    }
  }

  const generateTitle = (firstMessage: string): string => {
    const maxLength = 50
    if (firstMessage.length <= maxLength) return firstMessage
    return firstMessage.substring(0, maxLength) + '...'
  }

  const startGame = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        body: JSON.stringify({ isStart: true, mode: gameMode })
      })

      if (!response.ok) {
        throw new Error('Failed to generate story')
      }
  
      const data = await response.json() as GenerateStoryResponse

      const messageId = crypto.randomUUID()

      const newMessage: GameMessage = {
        id: messageId,
        role: 'assistant',
        content: data.narrative,
        imageLoading: gameMode === 'imagen',
        videoLoading: gameMode === 'video'
      }

      setMessages([newMessage])
      
      if (gameMode === 'imagen' && data.imagePrompt) {
        generateImage(messageId, data.imagePrompt)
      }
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateImage = async (messageId: string, imagePrompt: string, conversationId?: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          imagePrompt: imagePrompt
        })
      })
  
      if (!response.ok) {
        throw new Error('Failed to generate image')
      }
  
      const imageData = await response.json()
      
      if (!imageData.task_id) {
        throw new Error('No task_id returned')
      }

      let pollCount = 0;
      let generatedImageUrl: string | null = null;
      
      while (pollCount < 20 && !generatedImageUrl) {
        await new Promise(resolve => setTimeout(resolve, 3000)); 
        
        try {
          const statusResponse = await fetch(`/api/gemini-status?task_id=${imageData.task_id}`);
          if (!statusResponse.ok) break;
          
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'COMPLETED' && statusData.generated && statusData.generated.length > 0) {
            generatedImageUrl = statusData.generated[0];
            
            if (conversationId && generatedImageUrl) {
              if (userId) {
                await saveGeneratedImage(conversationId, imagePrompt, generatedImageUrl)
              }
            }
            
            break;
          } else if (statusData.status === 'FAILED') {
            break;
          }
        } catch (pollError) {
          console.error('Error polling status:', pollError);
          break;
        }
        
        pollCount++;
      }
  
      setMessages(prevMessages => prevMessages.map(message => {
        if (message.id === messageId) {
          const updatedMessage = { 
            ...message, 
            image: generatedImageUrl ? { url: generatedImageUrl } : undefined, 
            imageLoading: false 
          }
          
          if (!userId && conversationId) {
            updateLocalConversationMessage(conversationId, messageId, updatedMessage)
          }
          
          return updatedMessage
        }
  
        return message
      }))
    } catch (error) {
      console.error('Error generating image:', error);
      setMessages(prevMessages => prevMessages.map(message => {
        if (message.id === messageId) {
          return { ...message, imageLoading: false }
        }

        return message
      }))
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const { supabase } = await import('@/utils/supabase/client')

      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `video-images/${fileName}`

      const { data, error } = await supabase.storage
        .from('game-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading to Supabase:', error)
        alert('Error al subir la imagen. Por favor intenta de nuevo.')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath)

      setUploadedImage(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen. Por favor intenta de nuevo.')
    }
  }

  const generateVideo = async (messageId: string, videoPrompt: string, imageUrl?: string, conversationId?: string) => {
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: JSON.stringify({
          videoPrompt: videoPrompt,
          imageUrl: imageUrl
        })
      })
  
      if (!response.ok) {
        throw new Error('Failed to generate video')
      }
  
      const videoData = await response.json()
      
      if (!videoData.task_id) {
        throw new Error('No task_id returned')
      }

      let pollCount = 0;
      let generatedVideoUrl: string | null = null;
      
      while (pollCount < 30 && !generatedVideoUrl) {
        await new Promise(resolve => setTimeout(resolve, 5000)); 
        
        try {
          const statusResponse = await fetch(`/api/kling-status?task_id=${videoData.task_id}`);
          if (!statusResponse.ok) {
            console.error('Status check failed:', statusResponse.status)
            break;
          }
          
          const statusData = await statusResponse.json();
          console.log('Video status:', statusData.status, 'Poll count:', pollCount)
          
          if (statusData.status === 'COMPLETED' && statusData.generated && statusData.generated.length > 0) {
            generatedVideoUrl = statusData.generated[0];
            console.log('Video completed! URL:', generatedVideoUrl)
            
            // Guardar en base de datos o localStorage
            if (conversationId && generatedVideoUrl && imageUrl) {
              if (userId) {
                const saved = await saveGeneratedVideo(conversationId, videoPrompt, imageUrl, generatedVideoUrl)
                console.log('Video saved to DB:', saved)
              }
            }
            
            break;
          } else if (statusData.status === 'FAILED') {
            console.error('Video generation failed')
            break;
          }
        } catch (pollError) {
          console.error('Error polling video status:', pollError);
          break;
        }
        
        pollCount++;
      }
  
      console.log('Updating message with video URL:', generatedVideoUrl)
      setMessages(prevMessages => {
        const updated = prevMessages.map(message => {
          if (message.id === messageId) {
            console.log('Found message to update, setting videoLoading to false')
            const updatedMessage = { 
              ...message, 
              video: generatedVideoUrl ? { url: generatedVideoUrl } : undefined, 
              videoLoading: false 
            }
            
            if (!userId && conversationId) {
              updateLocalConversationMessage(conversationId, messageId, updatedMessage)
            }
            
            return updatedMessage
          }
          return message
        })
        return updated
      })
    } catch (error) {
      console.error('Error generating video:', error);
      setMessages(prevMessages => prevMessages.map(message => {
        if (message.id === messageId) {
          return { ...message, videoLoading: false }
        }
        return message
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (gameMode === 'video' && !uploadedImage) {
      alert('Por favor sube una imagen primero para generar el video')
      return
    }

    let conversationId = currentConversationId
    if (!conversationId) {
      const title = generateTitle(input)
      conversationId = await startNewConversation(title)
    }

    const userMessage: GameMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      uploadedImageUrl: gameMode === 'video' ? (uploadedImage ?? undefined) : undefined
    }

    setIsLoading(true)
    setInput('')
    setMessages(prevMessages => [...prevMessages, userMessage])

    if (conversationId) {
      if (userId) {
        await saveMessage(conversationId, 'user', input)
      } else {
        addMessageToLocalConversation(conversationId, userMessage)
      }
    }

    try {
      if (gameMode === 'imagen') {
        const messageId = crypto.randomUUID()
        const assistantMessage: GameMessage = {
          id: messageId,
          role: 'assistant',
          content: '',
          imageLoading: true
        }
        setMessages(prevMessages => [...prevMessages, assistantMessage])
        
        if (conversationId) {
          if (userId) {
            await saveMessage(conversationId, 'ai', '')
          } else {
            addMessageToLocalConversation(conversationId, assistantMessage)
          }
        }
        
        generateImage(messageId, input, conversationId ?? undefined)
      } else if (gameMode === 'video') {
        const messageId = crypto.randomUUID()
        const assistantMessage: GameMessage = {
          id: messageId,
          role: 'assistant',
          content: '',
          videoLoading: true
        }
        setMessages(prevMessages => [...prevMessages, assistantMessage])
        
        if (conversationId) {
          if (userId) {
            await saveMessage(conversationId, 'ai', '')
          } else {
            addMessageToLocalConversation(conversationId, assistantMessage)
          }
        }
        
        generateVideo(messageId, input, uploadedImage!, conversationId ?? undefined)
      } else {
        const response = await fetch('/api/generate-story', {
          method: 'POST',
          body: JSON.stringify({
            userMessage: input,
            conversationHistory: messages,
            isStart: false,
            mode: gameMode
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate story')
        }

        const data = await response.json() as GenerateStoryResponse
        
        const assistantMessage: GameMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.narrative
        }

        setMessages(prevMessages => [...prevMessages, assistantMessage])
        
        if (conversationId) {
          if (userId) {
            await saveMessage(conversationId, 'ai', data.narrative)
          } else {
            addMessageToLocalConversation(conversationId, assistantMessage)
          }
        }
      }
    } catch (error) {
      console.error('Error generating story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleModeChange = (newMode: GameMode) => {
    if (newMode !== gameMode) {
      setGameMode(newMode)
      setMessages([]) 
      setInput('')
      setCurrentConversationId(null)
      setUploadedImage(null)
    } else {
      setMessages([]) 
      setInput('')
      setCurrentConversationId(null)
      setUploadedImage(null)
    }
  }

  return { 
    messages, 
    input, 
    isLoading, 
    isLoadingConversation,
    gameMode, 
    uploadedImage,
    currentConversationId,
    startGame, 
    handleSubmit, 
    handleInputChange, 
    handleModeChange,
    handleImageUpload,
    loadConversation,
    startNewConversation
  }
}