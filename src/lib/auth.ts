import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/lib/types'

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (claimsError || !userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, role, school_id, village, grade, username, joined_year, schools(id, name, village)',
    )
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as unknown as Profile
})

export async function requireProfile(allowedRoles?: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }

  return profile
}
