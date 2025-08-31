'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

type UserSupabase = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
}

export default function AjoutUtilisateur() {
  const [activeTab, setActiveTab] = useState<'add' | 'invite'>('add')
  const [lignes, setLignes] = useState('')
  const [type, setType] = useState<'E' | 'P'>('E')
  const [rapport, setRapport] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserSupabase[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const router = useRouter()

  /** ----------- Gestion ajout utilisateurs ----------- */
  const handleSubmit = async () => {
    setLoading(true)
    setRapport([])

    try {
      const formattedLines = lignes
        .split('\n')
        .map((ligne) => {
          const parts = ligne.split(';').map((p) => p.trim())
          if (parts.length < 3) return null
          return `${parts[0]};${parts[1]};${parts[2]};${type}`
        })
        .filter((l): l is string => l !== null)
        .join('\n')

      const res = await fetch('/api/completerAnnuaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lignes: formattedLines })
      })

      const data = await res.json()
      setRapport(data.rapport || [])
    } catch (err) {
      console.error(err)
      setRapport(['❌ Erreur lors de la requête'])
    } finally {
      setLoading(false)
    }
  }

  /** ----------- Gestion liste utilisateurs + invitations ----------- */
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/listUsers') // API côté serveur qui utilise service role key
      const data = await res.json()
      console.log(data)
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("fr-FR");
  };

  useEffect(() => {
    if (activeTab === 'invite') fetchUsers()
  }, [activeTab])

  const handleBack = () => router.push('/annuaire')

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold" style={{ color: '#1b0a6d' }}>
            Gestion des utilisateurs
          </h1>
          <button
            onClick={handleBack}
            className="bg-[#1b0a6d] text-white hover:bg-[#d3243a] px-4 py-2 rounded cursor-pointer"
          >
            Retour
          </button>
        </div>

        {/* --------- Onglets --------- */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 mr-2 rounded-l cursor-pointer ${
              activeTab === 'add' ? 'bg-[#1b0a6d] text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('add')}
          >
            Ajouter des utilisateurs
          </button>
          <button
            className={`px-4 py-2 ml-2 rounded-r cursor-pointer ${
              activeTab === 'invite' ? 'bg-[#1b0a6d] text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('invite')}
          >
            Inviter des utilisateurs
          </button>
        </div>

        {/* --------- Contenu onglet "Ajouter" --------- */}
        {activeTab === 'add' && (
          <div>
            <label className="block mb-2 font-semibold">Type d&apos;utilisateur :</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'E' | 'P')}
              className="border p-2 rounded mb-4 w-full cursor-pointer"
            >
              <option value="E">Élèves</option>
              <option value="P">Professeurs</option>
            </select>

            <label className="block mb-2 font-semibold">Liste à importer :</label>
            <textarea
              value={lignes}
              onChange={(e) => setLignes(e.target.value)}
              placeholder="Une ligne par nouvel utilisateur, Format : Nom; Prénom; Email"
              className="border p-2 rounded w-full h-40 mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 rounded text-black w-full bg-[#D1D6F6] hover:bg-violet-400 cursor-pointer"
            >
              {loading ? 'Traitement...' : 'Compléter l’annuaire'}
            </button>

            {rapport.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h2 className="font-semibold mb-2">Rapport :</h2>
                <ul className="space-y-1">
                  {rapport.map((ligne, idx) => (
                    <li
                      key={idx}
                      className={
                        ligne.startsWith('✅')
                          ? 'text-green-600'
                          : ligne.startsWith('❌')
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }
                    >
                      {ligne}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* --------- Contenu onglet "Inviter" --------- */}
        {activeTab === 'invite' && (
          <div>
            {loadingUsers ? (
              <div>
                <LoadingSpinner />
                <p className="mr-4">Chargement des utilisateurs...</p>
              </div>
            ) : (
              <table className="w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border">Email</th>
          <th className="p-2 border">Créé le</th>
          <th className="p-2 border">S&apos;est déjà connecté ?</th>
          <th className="p-2 border">Dernière connexion</th>
        </tr>
      </thead>
      <tbody>
      {users.map((u) => {
        const registered = !!u.last_sign_in_at; // toujours un booléen
        
        return (
          <tr key={u.id}>
            <td className="p-2 border">{u.email}</td>
            <td className="p-2 border">{formatDate(u.created_at)}</td>
            <td className="p-2 border text-center">
              {registered ? "✅" : "❌"}
            </td>
            <td className="p-2 border">{u.last_sign_in_at ? formatDate(u.last_sign_in_at) : "-"}</td>
          </tr>
        );
      })}
      </tbody>
    </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
