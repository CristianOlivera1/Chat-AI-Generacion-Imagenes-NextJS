'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type GameMode } from '@/lib/types'
import { MessageSquare, Image, Video, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  mode: 'chat' | 'imagen' | 'video'
  started_at: string
}

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onNewChat: () => void
  isLoading?: boolean
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  isLoading = false
}: ChatSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'chat':
        return <MessageSquare className="w-4 h-4" />
      case 'imagen':
        return <Image className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'chat':
        return 'Chat'
      case 'imagen':
        return 'Imagen'
      case 'video':
        return 'Video'
      default:
        return 'Chat'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return 'Hoy'
    } else if (diffInHours < 48) {
      return 'Ayer'
    } else if (diffInHours < 168) {
      return `Hace ${Math.floor(diffInHours / 24)} días`
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
  }

  if (collapsed) {
    return (
      <div className="w-16 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-4">
        <Button
          onClick={() => setCollapsed(false)}
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          onClick={onNewChat}
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-64 bg-transparent border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold text-white">Historial</h2>
        <Button
          onClick={() => setCollapsed(true)}
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-2">
        <Button
          onClick={onNewChat}
          className="w-full bg-white text-black hover:bg-gray-200 font-medium"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva conversación
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No hay conversaciones
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative"
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {getModeIcon(conv.mode)}
                    </div>
                    <div className="flex-1 min-w-0">
                     <div className="text-sm font-medium w-44 mr-6 overflow-hidden whitespace-nowrap">
                        {conv.title || 'Sin título'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500">
                          {getModeLabel(conv.mode)}
                        </span>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">
                          {formatDate(conv.started_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-400 hover:bg-zinc-700 h-7 w-7"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
