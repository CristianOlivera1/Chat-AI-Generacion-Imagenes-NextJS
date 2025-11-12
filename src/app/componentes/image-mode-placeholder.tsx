import { Message, MessageContent } from "@/components/message";
export function ImageModePlaceholder() {
    return (
        <Message from="assistant">
            <MessageContent>
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mt-2 mb-4">
                        <h2 className="text-3xl font-semibold text-white mb-2">Imagina. Describe. Crea.</h2>
                        <p className="text-gray-400 text-lg">
                            Con <span className="font-medium text-yellow-400">Nanobana</span>, transforma tus ideas en imágenes únicas. Solo escribe lo que quieres ver.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Columna izquierda con 2 imágenes */}
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

                        {/* Imagen derecha grande */}
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