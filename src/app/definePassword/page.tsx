'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function DefinirMotDePasse() {
  const [password, setPassword] = useState('')
  const [promo, setPromo] = useState('')
  const [message, setMessage] = useState('')
  const [typeUtilisateur, setTypeUtilisateur] = useState<'eleve' | 'professeur' | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSessionAndType = async () => {
      // Vérifie la session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setMessage('Lien invalide ou expiré.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Vérifie si l'utilisateur est dans eleves
      const { data: eleve } = await supabase
        .from('eleves')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (eleve) {
        setTypeUtilisateur('eleve')
        return
      }

      // Vérifie si l'utilisateur est dans professeurs
      const { data: prof } = await supabase
        .from('professeurs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prof) {
        setTypeUtilisateur('professeur')
      }
    }

    checkSessionAndType()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Met à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setMessage('Erreur lors de la mise à jour du mot de passe.')
      console.error(updateError)
      return
    }

    // 2. Récupère l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setMessage("Impossible de récupérer l'utilisateur.")
      console.error(userError)
      return
    }

    // 3. Si élève → update promo
    if (typeUtilisateur === 'eleve') {
      const { error: promoError } = await supabase
        .from('eleves')
        .update({ promo })
        .eq('user_id', user.id)

      if (promoError) {
        setMessage('Erreur lors de la mise à jour de la promo.')
        console.error(promoError)
        return
      }
    }

    setMessage('Compte configuré avec succès. Redirection...')
    setTimeout(() => router.push('/annuaire'), 2000)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">Définir votre mot de passe</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">

        {/* Champ promo uniquement si élève */}
        {typeUtilisateur === 'eleve' && (
          <input
            type="text"
            placeholder="Promo"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
        )}

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Valider
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
    </main>
  )
}
