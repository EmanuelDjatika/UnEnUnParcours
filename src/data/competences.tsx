import type { ReactNode } from 'react';
import type { CompetenceId } from '../types';

/** Un domaine du développement : nom, ce que l'enfant apprend, couleur et pictogramme */
export interface Competence {
  id: CompetenceId;
  nom: string;
  description: string;
  couleur: string;
  fond: string;
  icone: ReactNode;
}

const trait = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const COMPETENCES: Competence[] = [
  {
    id: 'motricite_fine', nom: 'Motricité', description: 'Saisir, pincer, lâcher avec les doigts',
    couleur: '#C76A00', fond: '#FCE9CF',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-5.5a1.5 1.5 0 0 1 3 0V12m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.6-2.2L4.3 15.6a1.6 1.6 0 0 1 2.4-2.1L8 15" /></svg>,
  },
  {
    id: 'coordination', nom: 'Coordination œil-main', description: 'Accorder le regard et le mouvement des mains',
    couleur: '#2E86DE', fond: '#E1EEFB',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle {...trait} cx="12" cy="12" r="3" /></svg>,
  },
  {
    id: 'motricite_globale', nom: 'Motricité globale', description: 'Bouger, se tenir, garder l’équilibre',
    couleur: '#2E9E4F', fond: '#E0F3E6',
    icone: <svg viewBox="0 0 24 24"><circle {...trait} cx="12" cy="4.5" r="2" /><path {...trait} d="M6 9.5l6 1.5 6-1.5M12 11v4.5M12 15.5 8.5 21M12 15.5l3.5 5.5" /></svg>,
  },
  {
    id: 'reflexion', nom: 'Réflexion', description: 'Comprendre, essayer, trouver la solution',
    couleur: '#7B5CD6', fond: '#ECE6FA',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" /></svg>,
  },
  {
    id: 'patience', nom: 'Patience', description: 'Recommencer, persévérer jusqu’à réussir',
    couleur: '#1F8A84', fond: '#DDF2F0',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="M6.5 3h11M6.5 21h11M7.5 3v2.5a4.5 4.5 0 0 0 2 3.7L12 11l2.5-1.8a4.5 4.5 0 0 0 2-3.7V3M7.5 21v-2.5a4.5 4.5 0 0 1 2-3.7L12 13l2.5 1.8a4.5 4.5 0 0 1 2 3.7V21" /></svg>,
  },
  {
    id: 'langage', nom: 'Langage', description: 'Écouter, nommer, dire les premiers mots',
    couleur: '#D9417A', fond: '#FBE4EC',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="M4 5.5h16v10H10l-4.5 4v-4H4z" /><path {...trait} d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" strokeWidth={2.6} /></svg>,
  },
  {
    id: 'sens', nom: 'Éveil des sens', description: 'Voir, toucher, écouter les sons',
    couleur: '#D99A00', fond: '#FBF0D2',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z" /></svg>,
  },
  {
    id: 'relation', nom: 'Lien et émotions', description: 'Partager, attendre son tour, être fier',
    couleur: '#E05A47', fond: '#FBE5E1',
    icone: <svg viewBox="0 0 24 24"><path {...trait} d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" /></svg>,
  },
];

export const competence = (id: CompetenceId) => COMPETENCES.find((c) => c.id === id);

/** Découpe un texte en points : une ligne = un point */
export const enLignes = (t: string) => t.split('\n').map((l) => l.replace(/^\s*(?:[-•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
