import { supabase } from './client'

// Obtener el ID de la tabla users basado en el email del usuario autenticado
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching user ID:', error)
    return null
  }

  return data?.id || null
}

// Obtener el ID de la tabla users basado en el user auth
export async function getUserIdFromAuth(authUserId: string): Promise<string | null> {
  const { data: authData } = await supabase.auth.getUser()
  
  if (!authData.user?.email) return null
  
  return getUserIdByEmail(authData.user.email)
}
