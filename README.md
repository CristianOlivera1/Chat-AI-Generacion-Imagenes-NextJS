# Chat AI y generación de imágenes

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)


## 🎮 Características

- **Narrativa Generada por IA**: Cada historia es única gracias a Google Gemini
- **Imágenes Dinámicas**: Visuales en estilo pixel art generadas automáticamente
- **Aventura Conversacional**: Interactúa usando lenguaje natural
- **Interfaz Moderna**: UI responsive y elegante con TailwindCSS
- **Autenticación**: Con google utilizando sepabase
- **Almacenamiento**: En la nube en supabase base de datos PostgreSQL

## 🛠️ Tecnologías

- **Framework**: [Next.js 15](https://nextjs.org/) con Turbopack
- **Frontend**: [React 19](https://reactjs.org/) con TypeScript
- **Estilos**: [TailwindCSS 4](https://tailwindcss.com/)
- **IA**: [Google Gemini](https://ai.google.dev/) para narrativa e imágenes
- **UI Components**: [AI Elements](https://ai-sdk.dev/elements/overview) de Vercel
- **Linting**: [Biome](https://biomejs.dev/)
- **Almacenamiento y autenticación**: [supabase](https://supabase.com/)

## 📦 Instalación

1. **Clona el repositorio**
   
```bash
git clone https://github.com/CristianOlivera1/Chat-AI-Generacion-Imagenes-NextJS.git
cd Chat-AI-Generacion-Imagenes-NextJS
```

2. **Instala las dependencias**
   
```bash
pnpm install
```

3. **Configura las variables de entorno**
   
```bash
cp .env.example .env.local
```
   
Añade tu clave de API de Google AI:
   
```env
GOOGLE_GENERATIVE_AI_API_KEY=tu_clave_aqui
```

4. **Inicia el servidor de desarrollo**

```bash
pnpm dev
```

5. **Abre tu navegador**

Visita [http://localhost:3000](http://localhost:3000).

## 🌟 Características Técnicas

- **Server Components**: Aprovecha las últimas características de React 19
- **Streaming**: Respuestas de IA en tiempo real
- **Optimización**: Turbopack para builds ultrarrápidos
- **AI-First Design**: Componentes nativos para IA con AI Elements de Vercel
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Type Safety**: TypeScript estricto para mayor confiabilidad