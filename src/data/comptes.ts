// Comptes de démonstration.
// ⚠️ Prototype sans serveur : les mots de passe sont dans le code du navigateur.
// En production, la connexion doit passer par un serveur (mots de passe chiffrés).

export type Role = 'admin' | 'mairie' | 'creche';

export interface Compte {
  identifiant: string;
  motDePasse: string;
  role: Role;
  /** Nom affiché : « Mairie de Lomé », « Crèche Les Petits Pas »… */
  nom: string;
  /** Ville gérée (compte mairie) */
  localiteId?: string;
  /** Crèche gérée (compte crèche) */
  crecheId?: string;
}

export const COMPTES: Compte[] = [
  { identifiant: 'admin', motDePasse: 'admin2026', role: 'admin', nom: 'Administration UNICEF' },
  { identifiant: 'mairie-lome', motDePasse: 'lome2026', role: 'mairie', nom: 'Mairie de Lomé', localiteId: 'lome' },
  { identifiant: 'mairie-kara', motDePasse: 'kara2026', role: 'mairie', nom: 'Mairie de Kara', localiteId: 'kara' },
  { identifiant: 'creche-petits-pas', motDePasse: 'creche2026', role: 'creche', nom: 'Crèche Les Petits Pas', crecheId: 'cr-be-tokoin' },
  { identifiant: 'creche-soleil', motDePasse: 'creche2026', role: 'creche', nom: 'Crèche Soleil', crecheId: 'cr-agoe-adido' },
  { identifiant: 'creche-espoir', motDePasse: 'creche2026', role: 'creche', nom: 'Crèche Espoir', crecheId: 'cr-kara-sud' },
  { identifiant: 'creche-arc-en-ciel', motDePasse: 'creche2026', role: 'creche', nom: 'Crèche Arc-en-ciel', crecheId: 'cr-tomde' },
];

/** Page d'accueil de chaque espace */
export const ACCUEIL: Record<Role, string> = { admin: '/admin', mairie: '/mairie', creche: '/creche' };
