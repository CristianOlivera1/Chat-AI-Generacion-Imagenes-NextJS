export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isStrongPassword = (password: string): { 
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Debe tener al menos 6 caracteres')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  return nameRegex.test(name) && name.trim().length > 0
}

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .trim()
}

export const randomDelay = async (minMs: number = 100, maxMs: number = 500): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise(resolve => setTimeout(resolve, delay))
}

export class RateLimiter {
  private key: string
  private maxAttempts: number
  private windowMs: number

  constructor(key: string, maxAttempts: number = 5, windowMs: number = 5 * 60 * 1000) {
    this.key = `rate_limit_${key}`
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  check(): { allowed: boolean; remainingAttempts: number; resetTime?: number } {
    if (typeof window === 'undefined') {
      return { allowed: true, remainingAttempts: this.maxAttempts }
    }

    const now = Date.now()
    const data = localStorage.getItem(this.key)
    
    if (!data) {
      this.reset()
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 }
    }

    const { attempts, startTime } = JSON.parse(data)
    
    if (now - startTime > this.windowMs) {
      this.reset()
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 }
    }

    if (attempts >= this.maxAttempts) {
      const resetTime = startTime + this.windowMs
      return { 
        allowed: false, 
        remainingAttempts: 0,
        resetTime
      }
    }

    return { 
      allowed: true, 
      remainingAttempts: this.maxAttempts - attempts - 1
    }
  }

  increment(): void {
    if (typeof window === 'undefined') return

    const now = Date.now()
    const data = localStorage.getItem(this.key)
    
    if (!data) {
      localStorage.setItem(this.key, JSON.stringify({
        attempts: 1,
        startTime: now
      }))
      return
    }

    const { attempts, startTime } = JSON.parse(data)
    
    if (now - startTime > this.windowMs) {
      localStorage.setItem(this.key, JSON.stringify({
        attempts: 1,
        startTime: now
      }))
      return
    }

    localStorage.setItem(this.key, JSON.stringify({
      attempts: attempts + 1,
      startTime
    }))
  }

  reset(): void {
    if (typeof window === 'undefined') return
    
    const now = Date.now()
    localStorage.setItem(this.key, JSON.stringify({
      attempts: 0,
      startTime: now
    }))
  }
}

export const isSafeUrl = (url: string): boolean => {
  const lowerUrl = url.toLowerCase().trim()
  
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ]
  
  return !dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))
}


export const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
