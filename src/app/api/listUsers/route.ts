import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Récupérer tous les utilisateurs Auth
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Récupérer les ids des élèves et professeurs
    const { data: eleves, error: errorEleves } = await supabaseAdmin
      .from("eleves")
      .select("user_id");

    const { data: profs, error: errorProfs } = await supabaseAdmin
      .from("professeurs")
      .select("user_id");

    if (errorEleves || errorProfs) {
      console.error(errorEleves || errorProfs);
      return NextResponse.json({ error: "Erreur lecture tables" }, { status: 400 });
    }

    // 3. Construire un dictionnaire id -> type
    const typeById: Record<string, string> = {};
    eleves?.forEach((e) => {
      typeById[e.user_id] = "E";
    });
    profs?.forEach((p) => {
      typeById[p.user_id] = "P";
    });

    // 4. Mapper les utilisateurs Auth
    const users = data.users.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      type_utilisateur: typeById[user.id] ?? null, // null si on n’a rien trouvé
    }));

    return NextResponse.json({ users });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
