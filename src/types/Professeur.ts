export interface Professeur {
    id: string;
    nom?: string;
    prenom?: string;
    promo?: string;
    email_pro?: string;
    email_contact?: string;
    telephone?: string;
    statut?: string;
    avatar_url?: string | null;
    lycees?: string[];
    professions?: string[];
    matieres?: string[];
    is_admin?: boolean;
    created_at?: string;
    user_id: string;
    }
    