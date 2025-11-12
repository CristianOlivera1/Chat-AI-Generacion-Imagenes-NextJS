'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
    const { user, signOut, loading } = useAuth()
    const [loggingOut, setLoggingOut] = useState(false)

    const handleSignOut = async () => {
        try {
            setLoggingOut(true)
            await signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            setLoggingOut(false)
        }
    }

    if (loading) {
        return (
            <nav className="dark:bg-transparent shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <img src="/logo-chat-ia.avif" alt="Logo Chat AI" className='size-8' />
                            <Link href="/" className="text-xl font-bold text-gray-900">
                                Chat AI
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="dark:bg-white/5 shadow-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
                <div className="flex justify-between">
                    <div className="flex items-center">
                        <img src="/logo-chat-ia.avif" alt="Logo Chat AI" className='size-8' />
                        <Link href="/" className="text-xl font-bold text-gray-white">
                            Chat AI
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-3">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-sm uppercase">
                                            {user.user_metadata?.full_name
                                                ? user.user_metadata.full_name
                                                    .split(" ")
                                                    .slice(0, 2)
                                                    .map((n: string) => n[0])
                                                    .join("")
                                                : `${user.user_metadata?.first_name?.[0] || "N"}${user.user_metadata?.last_name?.[0] || "N"}`}
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-100">
                                        {user.user_metadata?.full_name || user.email}
                                    </span>
                                </div>

                                <Button
                                    onClick={handleSignOut}
                                    disabled={loggingOut}
                                    variant="outline"
                                    size="sm" className='cursor-pointer'
                                >
                                    {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <Button variant="outline" size="sm" className='cursor-pointer'>
                                        Iniciar sesión
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className='cursor-pointer'>
                                        Registrarse
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}