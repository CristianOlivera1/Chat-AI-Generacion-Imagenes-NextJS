'use client'

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/conversation";
import { ChatSidebar } from "@/components/chat-sidebar";
import { GameInput } from "./componentes/game-input";
import { GameLoader } from "./componentes/game-loader";
import { GameMessage } from "./componentes/game-message";
import { ImageModePlaceholder } from "./componentes/image-mode-placeholder";
import { VideoModePlaceholder } from "./componentes/video-mode-placeholder";
import { useZombieGame } from "./hooks/use-zombie-game";
import { useColorExtractor } from "@/app/hooks/color-extractor";
import { useState, useEffect, useRef } from "react";
import { type GameMessage as GameMessageType, type GameMode } from "@/lib/types";
import { ChatModePlaceholder } from "./componentes/chat-mode-placeholder";
import { useAuth } from "@/contexts/AuthContext";
import { getUserConversations } from "@/utils/supabase/conversations";
import { getUserIdByEmail } from "@/utils/supabase/users";
import { getLocalConversations, deleteLocalConversation } from "@/utils/localStorage/conversations";
import { useRouter, useSearchParams } from "next/navigation";

interface Conversation {
  id: string
  title: string
  mode: 'chat' | 'imagen' | 'video'
  started_at: string
}

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dbUserId, setDbUserId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const { 
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
  } = useZombieGame(dbUserId ?? undefined)
  
  const [image, setImage] = useState<string | undefined>('');
  const lastMessageRef = useRef<GameMessageType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  
  useColorExtractor(image);

  useEffect(() => {
    const fetchDbUserId = async () => {
      if (!user?.email) {
        setDbUserId(null)
        return
      }
      
      const userId = await getUserIdByEmail(user.email)
      setDbUserId(userId)
    }

    fetchDbUserId()
  }, [user?.email])

  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true)
      
      if (dbUserId) {
        // Usuario  - cargar desde Supabase
        const convs = await getUserConversations(dbUserId)
        setConversations(convs as Conversation[])
      } else {
        // Sin usuario - cargar desde localStorage
        const localConvs = getLocalConversations()
        setConversations(localConvs.map(conv => ({
          id: conv.id,
          title: conv.title,
          mode: conv.mode,
          started_at: conv.started_at
        })))
      }
      
      setLoadingConversations(false)
    }

    fetchConversations()
  }, [dbUserId])

  useEffect(() => {
    const refreshConversations = async () => {
      if (!currentConversationId) return
      
      if (dbUserId) {
        const convs = await getUserConversations(dbUserId)
        setConversations(convs as Conversation[])
      } else {
        const localConvs = getLocalConversations()
        setConversations(localConvs.map(conv => ({
          id: conv.id,
          title: conv.title,
          mode: conv.mode,
          started_at: conv.started_at
        })))
      }
    }

    if (messages.length > 0) {
      refreshConversations()
    }
  }, [currentConversationId, messages.length, dbUserId])

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];

      if (latestMessage !== lastMessageRef.current &&
        latestMessage.image?.base64Data &&
        !latestMessage.imageLoading) {

        setImage(latestMessage.image.base64Data);
        lastMessageRef.current = latestMessage;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && !image) {
      const firstMessage = messages[0];
      if (firstMessage.image && !firstMessage.imageLoading) {
        setImage(firstMessage.image.base64Data);
      }
    }
  }, [messages, image]);

  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0 && currentConversationId !== conversationId && !isLoadingConversation) {
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        const modeMap: Record<string, GameMode> = {
          'chat': 'chat',
          'imagen': 'imagen',
          'video': 'video'
        }
        loadConversation(conversationId, modeMap[conversation.mode])
      }
    }
  }, [conversations.length]) 

  const handleSelectConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (!conversation) return

    const modeMap: Record<string, GameMode> = {
      'chat': 'chat',
      'imagen': 'imagen',
      'video': 'video'
    }

    router.push(`?conversation=${conversationId}`, { scroll: false })
    loadConversation(conversationId, modeMap[conversation.mode])
  }

  const handleDeleteConversation = (conversationId: string) => {
    setConversationToDelete(conversationId)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!conversationToDelete) return
    
    let success = false
    
    if (dbUserId) {
      // Usuario autenticado - eliminar de Supabase
      const { deleteConversation } = await import('@/utils/supabase/conversations')
      success = await deleteConversation(conversationToDelete)
    } else {
      // Sin usuario - eliminar de localStorage
      success = deleteLocalConversation(conversationToDelete)
    }
    
    if (success) {
      if (dbUserId) {
        const convs = await getUserConversations(dbUserId)
        setConversations(convs as Conversation[])
      } else {
        const localConvs = getLocalConversations()
        setConversations(localConvs.map(conv => ({
          id: conv.id,
          title: conv.title,
          mode: conv.mode,
          started_at: conv.started_at
        })))
      }
      
      if (currentConversationId === conversationToDelete) {
        handleNewChat()
        router.push('/', { scroll: false })
      }
    }
    
    setDeleteModalOpen(false)
    setConversationToDelete(null)
  }

  const handleNewChat = () => {
    router.push('/', { scroll: false })
    handleModeChange(gameMode)
  }

  return (
    <div className="font-sans h-[95vh] mx-auto overflow-hidden bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e3e,transparent)] flex">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
        isLoading={loadingConversations}
      />
      
      <div className="flex flex-col h-full flex-1">
        <Conversation>
          <ConversationContent className="max-w-xl mx-auto">
            {gameMode === 'chat' && messages.length === 0 && !isLoading && !isLoadingConversation && !currentConversationId && (
              <ChatModePlaceholder />
            )}
            {gameMode === 'imagen' && messages.length === 0 && !isLoading && !isLoadingConversation && !currentConversationId && (
              <ImageModePlaceholder />
            )}
            {gameMode === 'video' && messages.length === 0 && !isLoading && !isLoadingConversation && !currentConversationId && (
              <VideoModePlaceholder />
            )}
            {
              messages.map(message => (
                <GameMessage key={message.id} message={message} gameMode={gameMode} />
              ))
            }
            {isLoading && <GameLoader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="max-w-2xl w-full mx-auto pb-4">
          <GameInput
            input={input}
            gameMode={gameMode}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onModeChange={handleModeChange}
            onImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
            isLoading={isLoading}
          />
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Eliminar conversación</h3>
            <p className="text-zinc-400 mb-6">
              ¿Estás seguro de que quieres eliminar esta conversación? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setConversationToDelete(null)
                }}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

