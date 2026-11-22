import type { Structure, TypeStructure } from '../types';

/** Libellés et couleurs des trois types de structures */
export const TYPES_STRUCTURE: Record<TypeStructure, { libelle: string; pluriel: string; court: string; couleur: string }> = {
  creche: { libelle: 'Crèche', pluriel: 'crèches', court: 'crèche', couleur: '#E07B00' },
  ecole_prescolaire: { libelle: 'École préscolaire', pluriel: 'écoles', court: 'école', couleur: '#2E86DE' },
  centre_social: { libelle: 'Centre social', pluriel: 'centres sociaux', court: 'centre social', couleur: '#2E9E4F' },
};

export const LISTE_TYPES = Object.keys(TYPES_STRUCTURE) as TypeStructure[];

/** « Crèche Les Petits Pas (Bè-Tokoin) » → « Crèche Les Petits Pas » */
export const nomCourt = (nom: string) => nom.replace(/\s*\(.*\)$/, '') || nom;

/**
 * Nom avec article et type, pour les phrases :
 * « l'École préscolaire de Tokoin », « la Crèche Espoir »,
 * ou « Les Lucioles (centre social) » si le nom ne dit pas le type.
 */
export function nomAvecType(s: Structure): string {
  const n = nomCourt(s.nom);
  const t = TYPES_STRUCTURE[s.type];
  if (!n.toLowerCase().startsWith(t.libelle.toLowerCase())) return `${n} (${t.court})`;
  return /^[aeiouyéèêàâîôû]/i.test(n) ? `l'${n}` : `la ${n}`;
}

/** Résumé par type : « 2 crèches · 1 école · 1 centre social » */
export function resumeTypes(liste: Structure[]): string {
  return LISTE_TYPES.map((t) => {
    const n = liste.filter((s) => s.type === t).length;
    if (!n) return '';
    const m = TYPES_STRUCTURE[t];
    return `${n} ${n > 1 ? m.pluriel : m.court}`;
  }).filter(Boolean).join(' · ') || 'Aucune structure';
}

/** Icône du type : maison avec un cœur, bâtiment avec un drapeau, groupe de personnes */
export function IconeStructure({ type, taille = 14, couleur }: { type: TypeStructure; taille?: number; couleur?: string }) {
  const c = couleur ?? 'currentColor';
  return (
    <svg viewBox="0 0 16 16" width={taille} height={taille} aria-hidden="true" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {type === 'creche' && <>
        <path d="M2 7.5 8 2.5l6 5V14H2z" />
        <path d="M8 12.2s-2.3-1.4-2.3-2.9a1.15 1.15 0 0 1 2.3-.3 1.15 1.15 0 0 1 2.3.3c0 1.5-2.3 2.9-2.3 2.9z" fill={c} stroke="none" />
      </>}
      {type === 'ecole_prescolaire' && <>
        <path d="M2 14V7.5h12V14M1 14h14M6.5 14v-3h3v3M8 7.5V1.5" />
        <path d="M8 1.5h4l-1 1.25 1 1.25H8" fill={c} />
      </>}
      {type === 'centre_social' && <>
        <circle cx="8" cy="4.5" r="2" />
        <circle cx="3.3" cy="6.3" r="1.5" />
        <circle cx="12.7" cy="6.3" r="1.5" />
        <path d="M4.5 13.5a3.5 3.5 0 0 1 7 0M1 12.5a2.3 2.3 0 0 1 3.4-2M15 12.5a2.3 2.3 0 0 0-3.4-2" />
      </>}
    </svg>
  );
}

/** Petite étiquette colorée : icône + type de la structure */
export default function EtiquetteStructure({ type }: { type: TypeStructure }) {
  const m = TYPES_STRUCTURE[type];
  return (
    <span className="etiquette-structure" style={{ color: m.couleur, background: `color-mix(in srgb, ${m.couleur} 12%, transparent)` }}>
      <IconeStructure type={type} />
      {m.libelle}
    </span>
  );
}
