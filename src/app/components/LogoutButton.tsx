'use client'

import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    console.log("Déconnexion")
    router.push('/login')
  }

  return (
    <button 
        onClick={handleLogout}
        className="bg-[#d3243a] hover:bg-red-400 text-white font-medium py-2 px-4
        rounded-lg transition-colors duration-200 shadow cursor-pointer"
    >
      Se déconnecter
    </button>
  )
}
