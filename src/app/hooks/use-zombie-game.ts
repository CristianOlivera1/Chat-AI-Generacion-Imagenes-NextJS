import { useState, useEffect, use } from 'react';
import type { GameMessage, ConversationMessage, GenerateStoryResponse, GameMode } from '@/lib/types';

export function useZombieGame() {
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameMode, setGameMode] = useState<GameMode>('chat')
  
  useEffect(() => {
    if (gameMode === 'chat') {
      startGame()
    } else {
      // Para modo imagen, limpiar mensajes y no generar mensaje inicial
      setMessages([])
    }
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
        imageLoading: gameMode === 'imagen'
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

      // Poll gemini API hasta que la imagen esté lista
      let pollCount = 0;
      let generatedImageUrl: string | null = null;
      
      while (pollCount < 20 && !generatedImageUrl) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Espera 3 segundos
        
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: GameMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input
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
        imageLoading: gameMode === 'imagen'
      }

      setMessages(prevMessages => [...prevMessages, assistantMessage])
      
      if (gameMode === 'imagen' && data.imagePrompt) {
        generateImage(messageId, data.imagePrompt)
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
    setMessages([])  // Reiniciar mensajes al cambiar modo
    setInput('')    // Limpiar input
  }

  return { messages, input, isLoading, gameMode, startGame, handleSubmit, handleInputChange, handleModeChange }
}