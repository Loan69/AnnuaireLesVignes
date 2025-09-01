'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Eleve } from '@/types/Eleve'
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js'
import { Professeur } from '@/types/Professeur'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

type ProfileData =
  | { type: 'eleve'; data: Eleve }
  | { type: 'professeur'; data: Professeur }


export default function MonProfil() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileData | null>(null)

  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState<string | null>(null)
  const [inputLycee, setInputLycee] = useState("")
  const [inputEtude, setInputEtude] = useState("")
  const [inputMatiere, setInputMatiere] = useState("")
  const [inputProfession, setInputProfession] = useState("")

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dirty, setIsDirty] = useState<boolean>(false)

  const [table, setTable] = useState('')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  
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

  // Récupération du type de l'utilisateur (élève ou professeur)
  useEffect(() => {
    const fetchTableAndProfile = async () => {
      if (!user) return
  
      // 1️⃣ Chercher dans eleves
      const { data: eleveData } = await supabase
        .from('eleves')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
  
      if (eleveData) {
        setTable('eleves')
        setProfile({
          type: 'eleve',
          data: eleveData as Eleve,
        })
        setLoading(false)
        return
      }
  
      // 2️⃣ Chercher dans professeurs (si pas trouvé dans eleves)
      const { data: profData } = await supabase
        .from('professeurs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
  
      if (profData) {
        setTable('professeurs')
        setProfile({
          type: 'professeur',
          data: profData as Professeur,
        })
        setLoading(false)
        return
      }
  
      // 3️⃣ Aucun profil trouvé
      console.warn("Utilisateur introuvable dans 'eleves' et 'professeurs'")
    }
  
    fetchTableAndProfile()
  }, [user])
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return
    const { name, value } = e.target
  
    setProfile({
      ...profile,
      data: {
        ...profile.data,
        [name]: value,
      },
    })
  }
  

  const updateLycees = (newLycees: string[]) => {
    if (!profile) return
    setProfile({
      ...profile,
      data: {
        ...profile.data,
        lycees: newLycees,
      }
    })
    setIsDirty(true)
  }
  

  const updateEtudesSup = (newEtudes: string[]) => {
    if (!profile || profile.type !== 'eleve') return
  
    setProfile({
      ...profile,
      data: {
        ...profile.data,
        etudes_sup: newEtudes,
      }
    })
    setIsDirty(true)
  }

  const updateMatieres = (newMatieres: string[]) => {
    if (!profile || profile.type !== 'professeur') return
  
    setProfile({
      ...profile,
      data: {
        ...profile.data,
        matieres: newMatieres,
      }
    })
    setIsDirty(true)
  }

  const updateProfessions = (newProfessions: string[]) => {
    if (!profile || profile.type !== 'professeur') return
  
    setProfile({
      ...profile,
      data: {
        ...profile.data,
        professions: newProfessions,
      }
    })
    setIsDirty(true)
  }
  
  

  // Insertion ou modification de la photo de profil
  const handlePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string,
    supabase: SupabaseClient,
    setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>,
    setIsDirty?: (dirty: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
  
    // Aperçu instantané
    const localUrl = URL.createObjectURL(file);
    setPreviewAvatar(localUrl);
  
    const fileName = `avatar-${userId}`;
  
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: 'public, max-age=0',
      });
  
    if (uploadError) {
      console.error('Erreur lors de l’upload :', uploadError.message);
      return;
    }
  
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName);
  
    const { error: updateError } = await supabase
      .from(table)
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);
  
    if (updateError) {
      console.error('Erreur mise à jour avatar_url :', updateError.message);
      return;
    }
  
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          avatar_url: publicUrl,
        }
      };
    });
  
    if (setIsDirty) setIsDirty(true);
  };
  

  // Enregistrement des informations de l'utilisateur
  const handleUpdate = async () => {
    if (!user || !profile) return
  
    setLoading(true)
  
    const { error } = await supabase
      .from(table)
      .update(profile.data)
      .eq('user_id', user.id)
  
    if (error) {
      console.error("Erreur mise à jour profil :", error)
      setMessage("Erreur lors de l'enregistrement")
    } else {
      setMessage("Modifications enregistrées avec succès !")
      setIsDirty(false)
    }
  
    setLoading(false)
  }
   
  

  const handleBack = () => {
    router.push('/annuaire')
  }

  if(loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-lg border border-gray-100">

        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-[#1b0a6d]">Mes informations</h1>

            {/* Bouton de retour vers l'annuaire */}
            <button
              onClick={handleBack}
              className="text-sm bg-[#1b0a6d] text-white hover:bg-[#d3243a] px-4 py-2 rounded cursor-pointer"
            >
              Retour
            </button>
          </div>

          <div className="mt-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Photo de profil
            </label>

            <div className="flex items-center gap-4">
              <label
                htmlFor="avatar-upload"
                className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition"
              >
                Choisir un fichier
              </label>
              <span className="text-sm text-gray-500">
                {profile?.data.avatar_url ? "Photo sélectionnée" : "Aucun fichier sélectionné"}
              </span>
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (user?.id) {
                  handlePictureUpload(e, user.id, supabase, setProfile, setIsDirty);
                }
              }}
              className="hidden"
            />

            {(previewAvatar || profile?.data.avatar_url) && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Aperçu de la photo :</p>
                <div className="flex items-center gap-4">
                  <img
                    src={previewAvatar || `${profile?.data.avatar_url}?v=${Date.now()}`}
                    alt="photo utilisateur"
                    className="h-20 max-w-xs object-contain border border-gray-200 rounded-lg p-2 bg-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase.storage
                        .from("avatars")
                        .remove([`avatar-${user?.id}`]);

                      if (!error) {
                        // Supprimer l'aperçu
                        setPreviewAvatar(null)
                        // Met à jour l’état local
                        setProfile((prev) => {
                          if (!prev) return prev
                        
                          if (prev.type === 'eleve') {
                            const updated: ProfileData = {
                              type: 'eleve',
                              data: {
                                ...prev.data,
                                avatar_url: null,
                              }
                            }
                            return updated
                          }
                        
                          if (prev.type === 'professeur') {
                            const updated: ProfileData = {
                              type: 'professeur',
                              data: {
                                ...prev.data,
                                avatar_url: null,
                              }
                            }
                            return updated
                          }
                        
                          return prev
                        })
                      } else {
                        console.error("Erreur lors de la suppression du photo :", error);
                        alert("Erreur lors de la suppression de la photo.");
                      }
                    }}
                    className="cursor-pointer px-3 py-1.5 text-sm bg-[#d3243a] text-white border border-red-200 rounded hover:bg-red-400 transition"
                  >
                    Supprimer la photo
                  </button>
                </div>
              </div>
              )}
          </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                name="nom"
                value={profile?.data.nom ?? ''}
                disabled
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded cursor-not-allowed"
              />
            </div>

            {profile?.type === 'eleve' && (
              <div>
                <label className="block text-sm font-medium mb-1">Promotion</label>
                <input
                  name="promo"
                  value={profile?.data.promo ?? ''}
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={profile?.data.email_pro ?? ''}
                disabled
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Numéro de téléphone</label>
              <input
                name="telephone"
                placeholder='Numéro de téléphone'
                value={profile?.data.telephone ?? ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {profile?.type === 'eleve' && (
              <div>
                <label className="block text-sm font-medium mb-1">Lycée(s)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {/* Affichage des lycées sélectionnés sous forme de badges */}
                  {profile?.data.lycees?.map((lycee, idx) => (
                    <span
                      key={idx}
                      className="bg-[#1b0a6d] text-blue-100 px-3 py-1 rounded-full flex items-center"
                    >
                      {lycee}
                      <button
                        type="button"
                        onClick={() =>
                          updateLycees(profile.data.lycees!.filter((_, i) => i !== idx))
                        }
                        className="ml-2 text-blue-100 hover:text-blue-500 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={inputLycee}
                  onChange={(e) => setInputLycee(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === 'Return') && inputLycee.trim()) {
                      e.preventDefault()
                      if (!profile?.data.lycees?.includes(inputLycee.trim())) {
                        updateLycees([...(profile?.data.lycees || []), inputLycee.trim()])
                      }
                      setInputLycee('')
                    }
                  }}
                  placeholder="Ajoutez un lycée et appuyez sur Entrée"
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
            )}

            {profile?.type === 'eleve' && (
              <div>
                <label className="block text-sm font-medium mb-1">Études supérieures</label>
                 {/* Affichage des études sup sélectionnés sous forme de badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile?.type === 'eleve' &&
                    profile?.data.etudes_sup?.map((etude, idx) => (
                      <span
                        key={idx}
                        className="bg-[#1b0a6d] text-blue-100 px-3 py-1 rounded-full flex items-center"
                      >
                        {etude}
                        <button
                          type="button"
                          onClick={() =>
                            updateEtudesSup(profile.data.etudes_sup!.filter((_, i) => i !== idx))
                          }
                          className="ml-2 text-blue-100 hover:text-blue-500 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
                <input
                  value={inputEtude}
                  onChange={(e) => setInputEtude(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputEtude.trim()) {
                      e.preventDefault()
                      if (
                        profile?.type === 'eleve' &&
                        !profile?.data.etudes_sup?.includes(inputEtude.trim())
                      ) {
                        updateEtudesSup([...(profile?.data.etudes_sup || []), inputEtude.trim()])
                      }
                      setInputEtude('')
                    }
                  }}
                  placeholder="Ajoutez vos études supérieures et appuyez sur Entrée"
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
            )}

            {profile?.type === 'professeur' && (
              <div>
                <label className="block text-sm font-medium mb-1">Matière(s) enseignée(s)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile?.data.matieres?.map((matiere, idx) => (
                      <span
                        key={idx}
                        className="bg-[#1b0a6d] text-blue-100 px-3 py-1 rounded-full flex items-center"
                      >
                        {matiere}
                        <button
                          type="button"
                          onClick={() =>
                            updateMatieres(profile.data.matieres!.filter((_, i) => i !== idx))
                          }
                          className="ml-2 text-blue-100 hover:text-blue-500 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
                <input
                  value={inputMatiere}
                  onChange={(e) => setInputMatiere(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputMatiere.trim()) {
                      e.preventDefault()
                      if (
                        !profile?.data.matieres?.includes(inputMatiere.trim())
                      ) {
                        updateMatieres([...(profile?.data.matieres || []), inputMatiere.trim()])
                      }
                      setInputMatiere('')
                    }
                  }}
                  placeholder="Ajoutez les matières enseignées et appuyez sur Entrée"
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
            )}

            {profile?.type === 'professeur' && (
              <div>
                <label className="block text-sm font-medium mb-1">Profession(s)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile?.data.professions?.map((profession, idx) => (
                      <span
                        key={idx}
                        className="bg-[#1b0a6d] text-blue-100 px-3 py-1 rounded-full flex items-center"
                      >
                        {profession}
                        <button
                          type="button"
                          onClick={() =>
                            updateProfessions(profile.data.professions!.filter((_, i) => i !== idx))
                          }
                          className="ml-2 text-blue-100 hover:text-blue-500 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
                <input
                  value={inputProfession}
                  onChange={(e) => setInputProfession(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputProfession.trim()) {
                      e.preventDefault()
                      if (
                        !profile?.data.professions?.includes(inputProfession.trim())
                      ) {
                        updateProfessions([...(profile?.data.professions || []), inputProfession.trim()])
                      }
                      setInputProfession('')
                    }
                  }}
                  placeholder="Ajoutez vos professions si différentes de professeur"
                  className="w-full p-3 border border-gray-300 rounded"
                />
              </div>
            )}


            <div className="pt-4">
              <button
                onClick={handleUpdate}
                className="w-full bg-[#D1D6F6] text-black px-4 py-3 rounded hover:bg-violet-400 transition-colors cursor-pointer"
              >
                Enregistrer les modifications
              </button>
            </div>

            {message && (
              <p className="text-center text-sm text-[#1b0a6d] mt-2">{message}</p>
            )}
        </div>
      </div>
    </div>
  )
}
