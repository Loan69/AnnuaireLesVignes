"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { Eleve } from "@/types/Eleve"
import Header from "@/app/components/Header"
import LoadingSpinner from "@/app/components/LoadingSpinner"

export default function ProfilPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [eleve, setEleve] = useState<Eleve | null>(null)
  const [loading, setLoading] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)


  useEffect(() => {
    const fetchEleve = async () => {
      if (!params?.id) return
      const { data, error } = await supabase
        .from("eleves")
        .select("*")
        .eq("id", params.id)
        .maybeSingle()

      if (error) console.error("Erreur chargement élève:", error)
      setEleve(data as Eleve | null)
      setLoading(false)
    }
    fetchEleve()
  }, [params?.id])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!eleve) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <p>Aucun profil trouvé.</p>
        <Button className="mt-4" onClick={() => router.push("/annuaire")}>
          Retour à l&apos;annuaire
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Header/>

      <div className="min-h-screen bg-[#f9f9fc]">
        <div className="max-w-3xl mx-auto py-12 px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
            {/* Bouton retour */}
            <Button
              className="absolute top-4 right-4 bg-[#1b0a6d] text-white hover:bg-[#d3243a] cursor-pointer"
              onClick={() => router.push("/annuaire")}
            >
              Retour
            </Button>

            {/* Avatar + nom/promo animés */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {eleve.avatar_url ? (
                  <>
                    <img
                      src={eleve.avatar_url}
                      alt="Avatar"
                      onClick={() => setShowImageModal(true)}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#D1D6F6] shadow-md cursor-pointer hover:scale-105 transition-transform"
                    />

                    {showImageModal && (
                      <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        onClick={() => setShowImageModal(false)}
                      >
                        <div
                          className="relative"
                          onClick={(e) => e.stopPropagation()} // empêche la fermeture si on clique sur l'image
                        >
                          <img
                            src={eleve.avatar_url}
                            alt="Aperçu avatar"
                            className="max-h-[80vh] max-w-[90vw] rounded-2xl shadow-2xl"
                          />
                          <button
                            onClick={() => setShowImageModal(false)}
                            className="cursor-pointer absolute top-2 right-2 bg-black/50 text-white rounded-sm px-2 pb-0.5 hover:bg-black/70"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl shadow-md">
                    ?
                  </div>
                )}

              </motion.div>

              <motion.div
                className="text-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              >
                <h1 className="mt-4 text-3xl font-bold text-[#1b0a6d]">
                  {(eleve.prenom ?? "") + " " + (eleve.nom?.toUpperCase() ?? "")}
                </h1>
                <p className="text-lg text-gray-600">Promotion {eleve.promo ?? "non renseigné"}</p>
              </motion.div>
            </div>

            {/* Infos */}
            <div className="mt-8 space-y-4">
              <InfoRow label="Prénom" value={eleve.prenom} />
              <InfoRow label="Nom" value={eleve.nom?.toUpperCase()} />
              <InfoRow label="Promotion" value={eleve.promo} />
              <InfoRow label="Email de contact" value={eleve.email_perso} />
              <InfoRow label="Téléphone" value={eleve.telephone} />

              <ArrayRow label="Lycée(s)" items={eleve.lycees} />
              <ArrayRow label="Études supérieures" items={eleve.etudes_sup} />
              <ArrayRow label="Profession(s)" items={eleve.professions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Accepte string | null | undefined et gère le fallback */
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <span className="text-[#1b0a6d] font-semibold">{label}</span>
      <span className="text-gray-700">{value ?? "Non renseigné"}</span>
    </div>
  )
}

/** Affiche un tableau sous forme de "pills" (gère null/undefined ou mauvais types) */
function ArrayRow({ label, items }: { label: string; items?: string[] | null }) {
  const list = Array.isArray(items) ? items : []
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="block text-[#1b0a6d] font-semibold mb-2">{label}</span>
      {list.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {list.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-[#1b0a6d] text-white rounded-full text-sm shadow">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-700">Non renseigné</span>
      )}
    </div>
  )
}
