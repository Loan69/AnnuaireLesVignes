'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null);

  // Pré-remplissage depuis les query params (ou depuis sessionStorage si tu préfères)
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const passwordParam = searchParams.get('password')

    if (emailParam) setEmail(emailParam)
    if (passwordParam) setPassword(passwordParam)
  }, [searchParams])

  // Vérifie la session immédiatement au chargement
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/annuaire')
      }
    }
    checkSession()
  }, [supabase, router])


  // Vérification des infos de connexion de l'utilisateur
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !loginData.user) {
      setMessage('Connexion échouée : ' + error?.message);
    } else {
      router.push('/annuaire')
    }
  }

  return (
    <div>
      {/* Bandeau supérieur de la page */}
      <Header />

      {/* Formulaire de connexion */}
      <div className="max-w-md mx-auto mt-20 bg-white p-8 shadow rounded">
        <h2 className="text-2xl font-semibold text-[#1b0a6d] mb-6 text-center">Connexion</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Adresse email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Entrer votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Mot de passe</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Entrer votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Message d'erreur s'il y en a un */}
          {message && <p className="text-red-600 text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full bg-[#1b0a6d] text-white py-2 rounded hover:bg-[#D1D6F6] hover:text-black transition cursor-pointer"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
