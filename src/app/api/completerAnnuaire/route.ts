import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { lignes }: { lignes: string } = await req.json()

  if (!lignes || typeof lignes !== 'string') {
    return NextResponse.json({ rapport: ['❌ Aucun contenu fourni'] }, { status: 400 })
  }

  const rapport: string[] = []
  const lignesArray = lignes.split('\n').map((l) => l.trim()).filter(Boolean)

  // Récupération préalable de tous les utilisateurs
  const { data: allUsersData, error: allUsersError } = await supabase.auth.admin.listUsers()
  if (allUsersError) {
    return NextResponse.json({ rapport: [`❌ Erreur récupération utilisateurs : ${allUsersError.message}`] }, { status: 500 })
  }
  const allUsers = allUsersData?.users || []

  for (const ligne of lignesArray) {
    const parts = ligne.split(';').map((p) => p.trim())
    if (parts.length < 4) {
      rapport.push(`❌ Ligne ignorée (format invalide) : ${ligne}`)
      continue
    }

    const [nom, prenom, email, type] = parts
    if (!nom || !prenom || !email || !['E', 'P'].includes(type)) {
      rapport.push(`❌ Ligne invalide : ${ligne}`)
      continue
    }

    rapport.push(`ℹ️ Traitement de ${nom} ${prenom} (${email}) [${type}]`)

    // 1. Vérifier si le user existe dans auth
    let user = allUsers.find((u) => u.email === email)

    if (!user) {
      rapport.push(`ℹ️ Création du compte Supabase pour ${email}`)

      // Création du compte supabase et envoi d'un mail à l'utilisateur pour confirmer 
      const { data: created, error: errorCreated } = await supabase.auth.admin.inviteUserByEmail(email)

      if (!errorCreated) {
        rapport.push(`ℹ️ Email envoyé à ${email}`)
        user = created.user
      } else {
        rapport.push(`Erreur lors de l'envoi du mail de confirmation à ${email}`)
        console.error("Erreur lors de l'envoi du mail de confirmation : ", errorCreated.message)
      }

    }

    const table = type === 'E' ? 'eleves' : 'professeurs'

    // 2. Vérifier si déjà présent dans la table
    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq('email_pro', email)
      .maybeSingle()

    if (existing) {
      rapport.push(`ℹ️ Déjà présent dans ${table} → ignoré`)
      continue
    }

    // 3. Trouver prochain ID
    let newIdInt = 1
    const { data: maxData, error: maxError } = await supabase
      .from(table)
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    if (!maxError && maxData && maxData.length > 0) {
      newIdInt = maxData[0].id + 1
    }

    // 4. Insertion dans la bonne table
    const { error: insertError } = await supabase.from(table).insert({
      id: newIdInt,
      email_pro: email,
      nom,
      prenom,
      is_admin: false,
      user_id: user?.id
    })

    if (insertError) {
      rapport.push(`❌ Erreur insertion dans ${table} : ${insertError.message}`)
    } else {
      rapport.push(`✅ Ajouté à ${table} avec succès`)
    }
  }

  return NextResponse.json({ rapport })
}
