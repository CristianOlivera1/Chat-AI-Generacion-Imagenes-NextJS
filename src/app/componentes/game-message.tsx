import { Message, MessageContent } from "@/components/message";
import { Response } from "@/components/response";
import { type GameMessage as GameMessageType, type GameMode } from "@/lib/types";
import { Image } from "@/components/image";
import { UI_MESSAGES } from "@/lib/consts";
import { Loader } from "@/components/loader";

export function GameMessage({ message, gameMode }: { message: GameMessageType, gameMode: GameMode }) {
  const { role, content, image, imageLoading } = message;

  return (
    <Message from={role}>
      <MessageContent>
        {
          role === 'assistant' && gameMode === 'imagen' && (
            <picture className="w-full max-w-2xl aspect-video overflow-hidden rounded-md">
              {
                imageLoading && (
                  <div className="w-full h-full flex items-center justify-center bg-black/10">
                    <div className="flex mb-4 space-x-2">
                      <Loader />
                      <span>{UI_MESSAGES.LOADING.IMAGE}</span>
                    </div>
                  </div>
                )
              }

              {image && image.url && (
                <img
                  src={image.url}
                  alt="Generated image"
                  className="w-full h-full object-cover object-center rounded-md"
                />
              )}
            </picture>
          )
        }
        <Response>
          {content}
        </Response>
      </MessageContent>
    </Message>
  )
}