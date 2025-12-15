import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@/components/prompt-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UI_MESSAGES } from '@/lib/consts'
import type { GameMode } from '@/lib/types'

interface GameInputProps {
  input: string
  gameMode: GameMode
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onModeChange: (mode: GameMode) => void
  onImageUpload?: (file: File) => void
  uploadedImage?: string | null
  isLoading: boolean
}

export function GameInput({ input, gameMode, onInputChange, onSubmit, onModeChange, onImageUpload, uploadedImage, isLoading }: GameInputProps) {
  const inputTrimmed = input.trim()
  const inputSubmitIsDisabled = isLoading || inputTrimmed === '' || (gameMode === 'video' && !uploadedImage)
  
  const placeholder = gameMode === 'chat' 
    ? UI_MESSAGES.PLACEHOLDERS.CHAT_INPUT 
    : gameMode === 'imagen'
    ? UI_MESSAGES.PLACEHOLDERS.IMAGE_INPUT
    : UI_MESSAGES.PLACEHOLDERS.VIDEO_INPUT

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="game-mode" className="text-sm font-medium text-white/80">
          Modo:
        </label>
        <Select value={gameMode} onValueChange={onModeChange} disabled={isLoading}>
          <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">{UI_MESSAGES.MODES.CHAT}</SelectItem>
            <SelectItem value="imagen">{UI_MESSAGES.MODES.IMAGEN}</SelectItem>
            <SelectItem value="video">{UI_MESSAGES.MODES.VIDEO}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Input de imagen para modo video */}
      {gameMode === 'video' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              id="video-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-white/10 file:text-white
                hover:file:bg-white/20
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploadedImage && (
              <div className="flex-shrink-0">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="w-16 h-16 object-cover rounded-md border border-white/20"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      <PromptInput onSubmit={onSubmit} className='relative pr-8'>
        <PromptInputTextarea
          placeholder={placeholder}
          value={input}
          onChange={onInputChange}
          disabled={isLoading}
        />
        <PromptInputSubmit disabled={inputSubmitIsDisabled} className="absolute bottom-2 right-2" />
      </PromptInput>
    </div>
  )
}