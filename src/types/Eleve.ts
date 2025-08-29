export interface Eleve {
  id: string;
  nom?: string;
  prenom?: string;
  promo?: string;
  email_pro?: string;
  telephone?: string;
  statut?: string;
  avatar_url?: string | null;
  lycees?: string[];
  etudes_sup?: string[];
  is_admin?: boolean;
  user_id: string;
  }
  