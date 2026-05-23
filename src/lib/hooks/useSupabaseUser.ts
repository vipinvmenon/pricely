'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(!supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) return

    const supabase = createClient()

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, ready, signOut, configured: supabaseConfigured }
}
