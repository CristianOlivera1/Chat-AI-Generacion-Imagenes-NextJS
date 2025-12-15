import { useState, useEffect } from 'react';
import type { GameMessage, GenerateStoryResponse, GameMode } from '@/lib/types';

export function useZombieGame() {
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>('chat')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  
  useEffect(() => {
    if (gameMode === 'chat') {
      startGame()
    } else {
      setMessages([])
    }
    setUploadedImage(null)
  }, [gameMode])

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

  const generateImage = async (messageId: string, imagePrompt: string) => {
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
          return { 
            ...message, 
            image: generatedImageUrl ? { url: generatedImageUrl } : undefined, 
            imageLoading: false 
          }
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

  const generateVideo = async (messageId: string, videoPrompt: string, imageUrl?: string) => {
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
        await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos (videos toman más tiempo)
        
        try {
          const statusResponse = await fetch(`/api/kling-status?task_id=${videoData.task_id}`);
          if (!statusResponse.ok) break;
          
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'COMPLETED' && statusData.generated && statusData.generated.length > 0) {
            generatedVideoUrl = statusData.generated[0];
            break;
          } else if (statusData.status === 'FAILED') {
            break;
          }
        } catch (pollError) {
          console.error('Error polling video status:', pollError);
          break;
        }
        
        pollCount++;
      }
  
      setMessages(prevMessages => prevMessages.map(message => {
        if (message.id === messageId) {
          return { 
            ...message, 
            video: generatedVideoUrl ? { url: generatedVideoUrl } : undefined, 
            videoLoading: false 
          }
        }
  
        return message
      }))
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

    const userMessage: GameMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      uploadedImageUrl: gameMode === 'video' ? (uploadedImage ?? undefined) : undefined
    }

    setIsLoading(true)
    setInput('')
    setMessages(prevMessages => [...prevMessages, userMessage])

    try {
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
      
      const messageId = crypto.randomUUID()

      const assistantMessage: GameMessage = {
        id: messageId,
        role: 'assistant',
        content: data.narrative,
        imageLoading: gameMode === 'imagen',
        videoLoading: gameMode === 'video'
      }

      setMessages(prevMessages => [...prevMessages, assistantMessage])
      
      if (gameMode === 'imagen' && data.imagePrompt) {
        generateImage(messageId, data.imagePrompt)
      } else if (gameMode === 'video' && uploadedImage) {
        generateVideo(messageId, input, uploadedImage)
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
    setGameMode(newMode)
    setMessages([]) 
    setInput('')   
  }

  return { 
    messages, 
    input, 
    isLoading, 
    gameMode, 
    uploadedImage,
    startGame, 
    handleSubmit, 
    handleInputChange, 
    handleModeChange,
    handleImageUpload
  }
}