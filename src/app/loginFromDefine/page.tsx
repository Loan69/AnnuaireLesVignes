'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginFromDefine() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const email = sessionStorage.getItem('email')
    const password = sessionStorage.getItem('password')

    if (!email || !password) {
      router.push('/login')
      return
    }

    const doLogin = async () => {
      // 1. Connexion
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      // Nettoyage
      sessionStorage.removeItem('email')
      sessionStorage.removeItem('password')

      if (error) {
        console.error('Erreur de connexion :', error)
        router.push('/login')
        return
      }

      // 2. Attendre que la session soit hydratée
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/annuaire')
      } else {
        console.warn('Session non trouvée immédiatement, on retente...')
        // petit retry après 500 ms si la session n’est pas encore dispo
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (retrySession) {
            router.push('/annuaire')
          } else {
            router.push('/login')
          }
        }, 500)
      }
    }

    doLogin()
  }, [router, supabase])

  return <p>Connexion en cours...</p>
}
