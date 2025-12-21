'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error during auth callback:', error)
        router.push('/login?error=auth_error')
        return
      }

      if (data.session) {
        router.push('/')
      } else {
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black">
      <div className="text-center">
        <img src="/logo-chat-ia.avif" alt="Logo Chat IA" className='animate-pulse' />
        <p className="mt-4 text-white">Completando autenticación...</p>
      </div>
    </div>
  )
}