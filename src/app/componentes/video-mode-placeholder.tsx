
export function VideoModePlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <h2 className="text-6xl font-black bg-linear-to-r from-black/0 via-white to-black/0 bg-clip-text text-transparent">
                Generador de Videos con IA
            </h2>

            <div className="mt-8 text-md text-gray-300 max-w-3xl">
                <p className="text-sm text-gray-400 italic">
                    Ejemplo: "Ciudad futurista eco-futurista con arquitectura biofílica, rascacielos cubiertos de jardines verticales y terrazas verdes, calles rodeadas de árboles y plantas exóticas, puentes con vegetación colgante, ambiente limpio y luminoso, diseño orgánico que mezcla tecnología avanzada con naturaleza abundante, estilo realista y cinematográfico, atmósfera utópica y sostenible."
                </p>
            </div>
        </div>
    );
}