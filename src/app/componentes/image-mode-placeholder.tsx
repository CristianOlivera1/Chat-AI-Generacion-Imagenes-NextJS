import { Message, MessageContent } from "@/components/message";
export function ImageModePlaceholder() {
    return (
        <Message from="assistant">
            <MessageContent>
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mt-2 mb-4">
                        <h2 className="text-5xl font-black mb-2 bg-linear-to-r from-black/0 via-white to-black/0 bg-clip-text text-transparent">
                            Generador de Imágenes con IA
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-4">
                            <img
                                src="/image1.avif"
                                alt="Big Ben"
                                className="rounded-3xl shadow-lg object-cover w-full h-36"
                            />
                            <img
                                src="/image2.avif"
                                alt="Torre de Pisa"
                                className="rounded-3xl shadow-lg object-cover w-full h-36"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <img
                                src="/image3.avif"
                                alt="Torre Eiffel"
                                className="rounded-3xl shadow-lg object-cover w-full h-[305px]"
                            />
                        </div>
                    </div>
                </div>
            </MessageContent>
        </Message>
    )
}