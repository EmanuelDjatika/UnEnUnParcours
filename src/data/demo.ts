import type { Donnees, Enfant, Langue, Localite, Presence, Quartier, Region, Sexe, Structure } from '../types';
import { ATELIERS_PAR_DEFAUT, JEUX_PAR_DEFAUT } from './ateliers';

// Données de démonstration : 60 enfants fictifs, 2 localités, 6 quartiers, 4 structures
// (2 crèches, 1 école préscolaire, 1 centre social).
// Tous les noms et numéros sont inventés (+228 90 00 00 xx).

// Les 5 régions du Togo
export const REGIONS_BASE: Region[] = [
  { id: 'maritime', nom: 'Maritime' },
  { id: 'plateaux', nom: 'Plateaux' },
  { id: 'centrale', nom: 'Centrale' },
  { id: 'r-kara', nom: 'Kara' },
  { id: 'savanes', nom: 'Savanes' },
];

// Villes, rattachées à une région
export const LOCALITES_BASE: Localite[] = [
  { id: 'lome', nom: 'Lomé', regionId: 'maritime' },
  { id: 'kara', nom: 'Kara', regionId: 'r-kara' },
];

export const STRUCTURES_BASE: Structure[] = [
  { id: 'cr-be-tokoin', nom: 'Crèche Les Petits Pas', type: 'creche', localiteId: 'lome', animatrice: 'Akouvi Mensah' },
  { id: 'st-ecole-tokoin', nom: 'École préscolaire de Tokoin', type: 'ecole_prescolaire', localiteId: 'lome', animatrice: 'Dzifa Lawson' },
  { id: 'st-centre-agoe', nom: "Centre social d'Agoè", type: 'centre_social', localiteId: 'lome', animatrice: 'Massan Akakpo' },
  { id: 'cr-kara-sud', nom: 'Crèche Espoir', type: 'creche', localiteId: 'kara', animatrice: 'Essohanam Tchalla' },
];

export const QUARTIERS_BASE: Quartier[] = [
  { id: 'q-be', nom: 'Bè', localiteId: 'lome', structureId: 'cr-be-tokoin' },
  { id: 'q-tokoin', nom: 'Tokoin', localiteId: 'lome', structureId: 'st-ecole-tokoin' },
  { id: 'q-agoe', nom: 'Agoè', localiteId: 'lome', structureId: 'st-centre-agoe' },
  { id: 'q-adidogome', nom: 'Adidogomé', localiteId: 'lome', structureId: 'st-centre-agoe' },
  { id: 'q-kara-sud', nom: 'Kara-Sud', localiteId: 'kara', structureId: 'cr-kara-sud' },
  { id: 'q-tomde', nom: 'Tomdè', localiteId: 'kara', structureId: 'cr-kara-sud' },
];

const PRENOMS_F = ['Akossiwa', 'Adjoa', 'Ama', 'Abla', 'Afi', 'Yawa', 'Essi', 'Enyonam', 'Mawuena', 'Delali', 'Kafui', 'Sena', 'Pélagie', 'Essowè', 'Maba', 'Pidénam'];
const PRENOMS_M = ['Kodjo', 'Komi', 'Kossi', 'Koffi', 'Yao', 'Kwami', 'Kokou', 'Edem', 'Elom', 'Sélom', 'Mawuli', 'Essohana', 'Pitalounani', 'Tchilabalo', 'Batchassi', 'Kokouvi'];
const NOMS_SUD = ['Agbeko', 'Amouzou', 'Mensah', 'Lawson', 'Kpodar', 'Dogbé', 'Ahadji', 'Akakpo', 'Gbadoé', 'Adjavon'];
const NOMS_NORD = ['Bodjona', 'Essowazina', 'Tchalla', 'Pakoubi', 'Kpatcha', 'Tcha', 'Gnassingbé', 'Padaro', 'Assih', 'Balouki'];
const PRENOMS_PARENTS = ['Akouvi', 'Ayélé', 'Dzifa', 'Massan', 'Kayi', 'Mawussi', 'Afiwa', 'Essohanam', 'Komlan', 'Kodzo'];

/** Générateur pseudo-aléatoire déterministe (mêmes données à chaque chargement) */
function generateur(graine: number) {
  let s = graine;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function genererDemo(): Donnees {
  const rnd = generateur(2026);
  const choisir = <T,>(t: T[]): T => t[Math.floor(rnd() * t.length)];
  const auj = new Date();
  const enfants: Enfant[] = [];

  for (let i = 0; i < 60; i++) {
    const quartier = QUARTIERS_BASE[i % QUARTIERS_BASE.length];
    const sud = quartier.localiteId === 'lome';
    const sexe: Sexe = rnd() < 0.5 ? 'F' : 'M';
    const nom = choisir(sud ? NOMS_SUD : NOMS_NORD);
    // Âge réparti sur les 5 dernières années (0 à 5 ans)
    const ageJours = Math.floor(((i * 37) % 60) / 60 * 5 * 365 + rnd() * 30);
    const naissance = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() - ageJours);
    const langue: Langue = sud
      ? choisir<Langue>(['Éwé', 'Éwé', 'Mina', 'Français'])
      : choisir<Langue>(['Kabyè', 'Kabyè', 'Français', 'Autre']);
    enfants.push({
      id: `demo-${i + 1}`,
      prenom: choisir(sexe === 'F' ? PRENOMS_F : PRENOMS_M),
      nom,
      sexe,
      dateNaissance: iso(naissance),
      parentNom: `${choisir(PRENOMS_PARENTS)} ${nom}`,
      parentTelephone: `+228 90 00 00 ${String(i + 1).padStart(2, '0')}`,
      langue,
      localiteId: quartier.localiteId,
      quartierId: quartier.id,
      consentement: true,
      dateEnregistrement: new Date(Math.max(naissance.getTime(), auj.getTime() - 300 * 86400000)).toISOString(),
    });
  }

  // Quelques présences déjà cochées pour le mois précédent
  const prec = new Date(auj.getFullYear(), auj.getMonth() - 1, 1);
  const moisPrec = `${prec.getFullYear()}-${String(prec.getMonth() + 1).padStart(2, '0')}`;
  const presences: Presence[] = enfants
    .filter(() => rnd() < 0.7)
    .map((e) => {
      const confirme = rnd() < 0.75;
      return { enfantId: e.id, mois: moisPrec, appele: true, confirme, venu: confirme && rnd() < 0.8 };
    });

  return {
    regions: [...REGIONS_BASE],
    localites: [...LOCALITES_BASE],
    structures: [...STRUCTURES_BASE],
    quartiers: [...QUARTIERS_BASE],
    enfants,
    presences,
    ateliers: structuredClone(ATELIERS_PAR_DEFAUT),
    invitations: [],
    jeuxDefautVus: JEUX_PAR_DEFAUT.map((d) => d.jeu.id),
  };
}

/** Données de départ (sans enfants) */
export function donneesVides(): Donnees {
  return {
    regions: [...REGIONS_BASE],
    localites: [...LOCALITES_BASE],
    structures: [...STRUCTURES_BASE],
    quartiers: [...QUARTIERS_BASE],
    enfants: [],
    presences: [],
    ateliers: structuredClone(ATELIERS_PAR_DEFAUT),
    invitations: [],
    jeuxDefautVus: JEUX_PAR_DEFAUT.map((d) => d.jeu.id),
  };
}
