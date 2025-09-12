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
import LoadingSpinner from '../components/LoadingSpinner'

type ProfileData =
  | { type: 'eleve'; data: Eleve }
  | { type: 'professeur'; data: Professeur }

export default function Annuaire() {
  const [user, setUser] = useState<User | null>(null)

  const supabase = createClientComponentClient()
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [eleves, setEleves] = useState<Partial<Eleve>[]>([])
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
        .order('nom', { ascending: true })       // tri par nom
        .order('prenom', { ascending: true })   // tri par prénom

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
  
  if(loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <Header />
  
      {/* Header annuaire */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 mt-8 gap-4">
        {/* Titre de bienvenue affiché seulement si le prénom est chargé */}
        <div className="w-full md:w-auto text-center md:text-left">
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
        </div>
  
        {/* Boutons à droite */}
        <div className="flex flex-wrap justify-center items-center gap-2 w-full md:w-auto">
          <Button
            className="cursor-pointer hover:bg-gray-600 hover:text-white"
            variant="secondary"
            onClick={() => router.push('/monProfil')}
          >
            Mes paramètres
          </Button>
          
          {/* Bouton d'ajout d'utilisateurs : Seulement pour admin !! */}
          {(profile?.data.is_admin === true) && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#1b0a6d] text-white rounded hover:bg-[#D1D6F6] transition"
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

          {/* Version Ordinateur : tableau */}
          <div className="hidden sm:block overflow-x-auto">
          <table className="table-fixed border-collapse border border-gray-300 mx-auto">
            <thead className="bg-[#D1D6F6]">
              <tr>
                <th className="border px-2 py-2 w-40">Photo</th>
                <th className="border px-2 py-2 w-40">Nom</th>
                <th className="border px-2 py-2 w-40">Prénom</th>
                <th className="border px-2 py-2 w-40">Promotion</th>
                <th className="border px-2 py-2 w-40">Fiche élève</th>
              </tr>
            </thead>
            <tbody>
              {filteredEleves.map((eleve) => (
                <tr key={eleve.id}>
                  <td className="border py-2 text-center">
                    {eleve.avatar_url ? (
                      <img
                        src={eleve.avatar_url}
                        alt="Avatar"
                        className="w-18 h-18 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-18 h-18 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm mx-auto">
                        ?
                      </div>
                    )}
                  </td>
                  <td className="border px-2 py-2 text-center">{eleve.nom}</td>
                  <td className="border px-2 py-2 text-center">{eleve.prenom}</td>
                  <td className="border px-2 py-2 text-center">{eleve.promo ?? "Non renseignée"}</td>
                  <td className="border px-2 py-2 text-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/profil/${eleve.id}`)}
                      className="cursor-pointer text-sm"
                    >
                      Voir le profil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          </div>

        {/* Version Mobile : cartes */}
        <div className="block sm:hidden grid grid-cols-1 gap-4">
          {filteredEleves.map((eleve) => (
            <div
              key={eleve?.id}
              className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col items-center text-center"
            >
              {/* Avatar */}
              {eleve?.avatar_url ? (
                <img
                  src={eleve.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover mb-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl mb-2">
                  ?
                </div>
              )}

              {/* Infos */}
              <h3 className="font-semibold text-lg">{eleve?.prenom} {eleve?.nom}</h3>
              <p className="text-gray-500">Promo : {eleve?.promo ?? "Non renseignée"}</p>

              {/* Bouton profil */}
              <Button
                variant="outline"
                onClick={() => router.push(`/profil/${eleve?.id}`)}
                className="mt-3 w-full"
              >
                Visionner le profil
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
