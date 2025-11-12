'use client'

import { useState } from 'react'

interface Alert {
  id: string
  type: 'success' | 'error' | 'warning'
  title: string
  message: string
}

export const useAlert = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = (type: Alert['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newAlert: Alert = { id, type, title, message }
    
    setAlerts(prev => [...prev, newAlert])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(id)
    }, 5000)
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const showSuccess = (title: string, message: string) => {
    addAlert('success', title, message)
  }

  const showError = (title: string, message: string) => {
    addAlert('error', title, message)
  }

  const showWarning = (title: string, message: string) => {
    addAlert('warning', title, message)
  }

  return {
    alerts,
    showSuccess,
    showError,
    showWarning,
    removeAlert,
  }
}

// Helper function to parse Supabase errors
export const parseSupabaseError = (error: any): { title: string; message: string } => {
  if (error?.code === '23505') {
    if (error.message.includes('users_email_key')) {
      return {
        title: 'Email ya registrado',
        message: 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.'
      }
    }
  }

  if (error?.message === 'Invalid login credentials') {
    return {
      title: 'Credenciales incorrectas',
      message: 'El email o contraseña son incorrectos. Por favor verifica tus datos.'
    }
  }

  if (error?.message === 'Email not confirmed') {
    return {
      title: 'Email no verificado',
      message: 'Por favor verifica tu email antes de iniciar sesión.'
    }
  }

  if (error?.message?.includes('Password should be at least')) {
    return {
      title: 'Contraseña muy corta',
      message: 'La contraseña debe tener al menos 6 caracteres.'
    }
  }

  if (error?.message?.includes('Invalid email')) {
    return {
      title: 'Email inválido',
      message: 'Por favor ingresa un email válido.'
    }
  }

  // Default error
  return {
    title: 'Error',
    message: error?.message || 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.'
  }
}