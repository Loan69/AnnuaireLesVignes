'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import Header from '../components/Header'

export default function DefinirMotDePasse() {
  const [password, setPassword] = useState('')
  const [promo, setPromo] = useState('')
  const [message, setMessage] = useState('')
  const [typeUtilisateur, setTypeUtilisateur] = useState<'eleve' | 'professeur' | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSessionAndType = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setMessage('Lien invalide ou expiré.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: eleve } = await supabase
        .from('eleves')
        .select('id, email_pro')
        .eq('user_id', user.id)
        .maybeSingle()

      if (eleve) {
        setTypeUtilisateur('eleve')
        return
      }

      const { data: prof } = await supabase
        .from('professeurs')
        .select('id, email_pro')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prof) {
        setTypeUtilisateur('professeur')
      }
    }
    checkSessionAndType()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // 1. Met à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setMessage('Erreur lors de la mise à jour du mot de passe.');
      console.error(updateError);
      return;
    }
  
    // 2. Récupère l'utilisateur courant
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      setMessage("Impossible de récupérer l'utilisateur.");
      return;
    }

    // 3. Re-signe l'utilisateur pour forcer le cookie côté serveur
    const { error: signinError } = await supabase.auth.signInWithPassword({
      email: currentUser.email!,
      password,
    });
    if (signinError) {
      console.error(signinError);
      setMessage('Mot de passe défini mais problème de session, redirection...');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    // 4. Si élève, met à jour la promo
    if (typeUtilisateur === 'eleve') {
      const { error: promoError } = await supabase
        .from('eleves')
        .update({ promo })
        .eq('user_id', currentUser.id);

      if (promoError) {
        console.error(promoError);
        setMessage('Erreur lors de la mise à jour de la promo.');
        return;
      }
    }

    // 5. Redirige directement vers l'annuaire
    setMessage('Compte configuré avec succès. Redirection...');
    sessionStorage.setItem('email', currentUser.email!)
    sessionStorage.setItem('password', password)
    setTimeout(() => router.push('/loginFromDefine'), 1000);
   

  };
  
  

  return (
    <div>
      <Header />
      <main className="flex flex-col items-center bg-gray-50 p-6 pt-20 min-h-screen">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-[#1b0a6d] text-center mb-2">
            Bienvenue sur l’annuaire
          </h1>
          <p className="text-[#1b0a6d] text-center mb-6">
            Merci de finaliser la création de votre compte en définissant votre mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {typeUtilisateur === 'eleve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo</label>
                <input
                  type="text"
                  placeholder="Ex : 2020"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1b0a6d] text-white py-2 rounded-lg hover:bg-[#D1D6F6] hover:text-black font-medium transition-colors cursor-pointer"
            >
              Valider
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes('succès')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
