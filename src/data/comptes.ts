// Comptes de démonstration.
// ⚠️ Prototype sans serveur : les mots de passe sont dans le code du navigateur.
// En production, la connexion doit passer par un serveur (mots de passe chiffrés).

/** Trois espaces : administration, mairie, structure (crèche, école préscolaire ou centre social) */
export type Role = 'admin' | 'mairie' | 'structure';

export interface Compte {
  identifiant: string;
  motDePasse: string;
  role: Role;
  /** Nom affiché : « Mairie de Lomé », « École préscolaire de Tokoin »… */
  nom: string;
  /** Ville gérée (compte mairie) */
  localiteId?: string;
  /** Structure gérée (compte structure) */
  structureId?: string;
}

export const COMPTES: Compte[] = [
  { identifiant: 'admin', motDePasse: 'admin2026', role: 'admin', nom: 'Administration UNICEF' },
  { identifiant: 'mairie-lome', motDePasse: 'lome2026', role: 'mairie', nom: 'Mairie de Lomé', localiteId: 'lome' },
  { identifiant: 'mairie-kara', motDePasse: 'kara2026', role: 'mairie', nom: 'Mairie de Kara', localiteId: 'kara' },
  { identifiant: 'creche-petits-pas', motDePasse: 'eveil2026', role: 'structure', nom: 'Crèche Les Petits Pas', structureId: 'cr-be-tokoin' },
  { identifiant: 'ecole-tokoin', motDePasse: 'eveil2026', role: 'structure', nom: 'École préscolaire de Tokoin', structureId: 'st-ecole-tokoin' },
  { identifiant: 'centre-agoe', motDePasse: 'eveil2026', role: 'structure', nom: "Centre social d'Agoè", structureId: 'st-centre-agoe' },
  { identifiant: 'creche-espoir', motDePasse: 'eveil2026', role: 'structure', nom: 'Crèche Espoir', structureId: 'cr-kara-sud' },
];

/** Page d'accueil de chaque espace */
export const ACCUEIL: Record<Role, string> = { admin: '/admin', mairie: '/mairie', structure: '/structure' };
