'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'

export default function AjoutUtilisateur() {
  const [lignes, setLignes] = useState('')
  const [type, setType] = useState<'E' | 'P'>('E')
  const [rapport, setRapport] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

  const handleBack = () => {
    router.push('/annuaire')
  }

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
        <div className='flex justify-between'>
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1b0a6d' }}>
            Compléter l’annuaire
          </h1>
          <button
            onClick={handleBack}
            className="text-m bg-[#1b0a6d] text-white hover:bg-blue-300 px-4 py-2 rounded cursor-pointer"
          >
            Retour
          </button>
        </div>

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
    </div>
  )
}
