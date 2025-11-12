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
  isLoading: boolean
}

export function GameInput({ input, gameMode, onInputChange, onSubmit, onModeChange, isLoading }: GameInputProps) {
  const inputTrimmed = input.trim()
  const inputSubmitIsDisabled = isLoading || inputTrimmed === ''
  
  const placeholder = gameMode === 'chat' 
    ? UI_MESSAGES.PLACEHOLDERS.CHAT_INPUT 
    : UI_MESSAGES.PLACEHOLDERS.IMAGE_INPUT

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="game-mode" className="text-sm font-medium text-white/80">
          Modo:
        </label>
        <Select value={gameMode} onValueChange={onModeChange} disabled={isLoading}>
          <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chat">{UI_MESSAGES.MODES.CHAT}</SelectItem>
            <SelectItem value="imagen">{UI_MESSAGES.MODES.IMAGEN}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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