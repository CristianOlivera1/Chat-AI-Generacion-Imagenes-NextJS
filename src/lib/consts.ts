export const UI_MESSAGES = {
  LOADING: {
    STORY: 'Generando respuesta...',
    IMAGE: 'Generando imagen...',
    VIDEO: 'Generando video...'
  },
  ERROR: {
    STORY_GENERATION: 'Error al generar respuesta',
    IMAGE_GENERATION: 'Error al generar imagen',
    VIDEO_GENERATION: 'Error al generar video',
    MISSING_PROMPT: 'Falta el prompt para generar la respuesta'
  },
  PLACEHOLDERS: {
    INPUT: 'Escribe tu pregunta o mensaje...',
    CHAT_INPUT: 'Escribe tu mensaje...',
    IMAGE_INPUT: 'Describe la imagen que quieres generar...',
    VIDEO_INPUT: 'Describe el video que quieres generar...'
  },
  MODES: {
    CHAT: 'Chat',
    IMAGEN: 'Imagen',
    VIDEO: 'Imagen a video'
  }
}

export const GAME_CONFIG = {
  IMAGE: {
    DEFAULT_PROMPT: 'beautiful landscape digital art',
    SEPARATOR: 'IMAGEN: '
  },
  VIDEO: {
    DEFAULT_PROMPT: 'beautiful landscape cinematic video',
    SEPARATOR: 'VIDEO: '
  }
}