'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Eleve } from '@/types/Eleve'
import Header from '../components/Header'
import LogoutButton from '../components/LogoutButton'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { User } from '@supabase/auth-helpers-nextjs'
import { Professeur } from '@/types/Professeur'

type ProfileData =
  | { type: 'eleve'; data: Eleve }
  | { type: 'professeur'; data: Professeur }

export default function Annuaire() {
  const [user, setUser] = useState<User | null>(null)

  const supabase = createClientComponentClient()
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [eleves, setEleves] = useState<Partial<Eleve>[]>([])
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [table, setTable] = useState('')

  const [search, setSearch] = useState('')
  const [promoFilter, setPromoFilter] = useState<string | null>(null)

  // Chargement des données de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Erreur récupération du user:', error)
        return
      }
      setUser(user)
    }

    fetchUser()
  }, [])

  
  useEffect(() => {
    const fetchTableAndProfile = async () => {
      if (!user) return;
  
      // 🔍 1️⃣ Chercher dans eleves
      const { data: eleveData } = await supabase
        .from('eleves')
        .select('id, is_admin, prenom, nom')
        .eq('user_id', user.id)
        .maybeSingle();
  
      if (eleveData) {
        setTable('eleves');
        setProfile({
          type: 'eleve',
          data: eleveData as Eleve,
        });
        return;
      }
  
      // 🔍 2️⃣ Chercher dans professeurs
      const { data: profData } = await supabase
        .from('professeurs')
        .select('id, is_admin, prenom, nom')
        .eq('user_id', user.id)
        .maybeSingle();
  
      if (profData) {
        setTable('professeurs');
        setProfile({
          type: 'professeur',
          data: profData as Professeur,
        });
        return;
      }
  
      // 3️⃣ Aucun profil trouvé
      console.warn("Utilisateur introuvable dans 'eleves' et 'professeurs'");
    };
  
    fetchTableAndProfile();
  }, [user]);  

  // Récupération de l'ensemble des infos élèves pour affichage annuaire
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('eleves')
        .select('*')

      if (error) {
        setError('Erreur lors du chargement des élèves.')
        console.error(error)
      } else {
        setEleves(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  // Gestion des filtres de la page
  const filteredEleves = eleves.filter((eleve) => {
    const matchesSearch =
      `${eleve?.prenom ?? ''} ${eleve?.nom ?? ''} ${eleve?.email_pro ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
    const matchesPromo = promoFilter ? eleve?.promo === promoFilter : true
    return matchesSearch && matchesPromo
  })

  const uniquePromos = Array.from(new Set(eleves.map((e) => e?.promo))).filter(Boolean).sort()

  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div>
      <Header />
  
      {/* Header annuaire */}
      <div className="flex items-center justify-between px-[10px] mt-8">
        {/* Titre de bienvenue affiché seulement si le prénom est chargé */}
        {profile?.data?.prenom && (
          <div className="mt-8 text-left px-[10px]">
            <h1
              className="text-4xl font-extrabold text-transparent bg-clip-text animate-fade-in"
              style={{
                backgroundImage: 'linear-gradient(to right, #1b0a6d, #D1D6F6)', // violet pâle uni
              }}
            >
              Bienvenue {profile.data.prenom} 👋
            </h1>

            <p className="text-gray-600 text-lg mt-2 animate-slide-up">
              Heureux de vous retrouver dans l’espace des anciennes élèves.
            </p>
          </div>
        )}
  
        {/* Boutons à droite */}
        <div className="flex items-center gap-4">
          <Button
            className="cursor-pointer hover:bg-gray-600 hover:text-white"
            variant="secondary"
            onClick={() => router.push('/monProfil')}
          >
            Mes paramètres
          </Button>
  
          {(profile?.data.is_admin === true) && (
            <Link
              href="/admin/ajoutUtilisateur"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Admin
            </Link>
          )}
  
          <LogoutButton />
        </div>
      </div>

      <main className="p-4">
        {/* Filtres du tableau */}
        <div className="mb-4 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              className="p-2 border rounded w-full max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="p-2 border rounded"
              value={promoFilter ?? ''}
              onChange={(e) => setPromoFilter(e.target.value ? e.target.value : null)}
            >
              <option value="">Toutes les promos</option>
              {uniquePromos.map((promo) => (
                <option key={promo} value={promo}>
                  {promo}
                </option>
              ))}
            </select>
          </div>

          {/* Annuaires du collège */}
          <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-[#D1D6F6]">
            <tr>
              <th className="border px-4 py-2">Photo</th>
              <th className="border px-4 py-2">Prénom</th>
              <th className="border px-4 py-2">Nom</th>
              <th className="border px-4 py-2">Promotion</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Fiche utilisateur</th>
            </tr>
          </thead>
          <tbody>
            {filteredEleves.map((eleve) => (
              <tr key={eleve?.id}>
                <td className="border px-2 py-2 text-center">
                  {eleve?.avatar_url ? (
                    <img
                      src={eleve.avatar_url}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm mx-auto">
                      ?
                    </div>
                  )}
                </td>
                <td className="border px-4 py-2">{eleve?.prenom}</td>
                <td className="border px-4 py-2">{eleve?.nom}</td>
                <td className="border px-4 py-2">{eleve?.promo}</td>
                <td className="border px-4 py-2">{eleve?.email_pro}</td>
                <td className="border px-4 py-2 text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/profil/${eleve?.id}`)}
                    className="cursor-pointer"
                  >
                    Visionner le profil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
