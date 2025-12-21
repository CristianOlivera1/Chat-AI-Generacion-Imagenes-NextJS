import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Obtener cookie de sesión de Supabase
  const supabaseAuth = req.cookies.get('sb-alonohzyroikkifzeflq-auth-token')
  const hasSession = !!supabaseAuth

  // Rutas de autenticación a las que no se debe acceder si ya estás autenticado
  const authRoutes = ['/login', '/register']

  // Si el usuario está autenticado y trata de acceder a login/register, redirigir a home
  if (hasSession && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protección adicional: Headers de seguridad
  const response = NextResponse.next()
  
  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy - restringir acceso a APIs sensibles
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy - Diferente para desarrollo y producción
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    // CSP más permisivo para desarrollo (permite WebSocket para HMR)
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://*.supabase.co https://api.freepik.com wss://*;"
    )
  } else {
    // CSP más estricto para producción
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.freepik.com wss://*.supabase.co;"
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}