'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertManager } from '@/components/ui/alert'
import { useAlert, parseSupabaseError } from '@/hooks/useAlert'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signInWithGoogle, user } = useAuth()
  const { alerts, showSuccess, showError, removeAlert } = useAlert()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (error: any) {
      console.error('Error during sign in:', error)
      const { title, message } = parseSupabaseError(error)
      showError(title, message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      showError('Campos requeridos', 'Por favor ingresa tu email y contraseña.')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      showSuccess('¡Bienvenido!', 'Has iniciado sesión exitosamente.')
      setTimeout(() => router.push('/'), 1000)
    } catch (error: any) {
      console.error('Error during email sign in:', error)
      const { title, message } = parseSupabaseError(error)
      showError(title, message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Iniciar sesión
          </h1>
          <p className="text-sm text-gray-400">
            Ingresa a tu cuenta
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="relative w-full h-10 bg-white text-white dark:hover:bg-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            variant="outline"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                <span>Cargando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="shrink-0"
                >
                  <g fill="none" fillRule="evenodd" clipRule="evenodd">
                    <path fill="#f44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity="0.987" />
                    <path fill="#ffc107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity="0.997" />
                    <path fill="#448aff" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity="0.999" />
                    <path fill="#43a047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity="0.993" />
                  </g>
                </svg>
                <span>Continuar con Google</span>
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">
                O
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full h-10 px-3 rounded-md bg-gray-950 border border-gray-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-md bg-gray-950 border border-gray-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <Button
            onClick={handleEmailSignIn}
            className="w-full h-10 bg-white text-black hover:bg-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Iniciar sesión
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/register"
              className="text-white hover:underline font-medium transition-colors"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
      <AlertManager alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
  )
}