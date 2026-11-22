// Types partagés de l'application « Un enfant, un parcours d'éveil »

export type Sexe = 'F' | 'M';

export type Langue = 'Éwé' | 'Kabyè' | 'Mina' | 'Français' | 'Autre';

export const LANGUES: Langue[] = ['Éwé', 'Kabyè', 'Mina', 'Français', 'Autre'];

/** Une région du Togo (Maritime, Plateaux, Centrale, Kara, Savanes) */
export interface Region {
  id: string;
  nom: string;
}

/** Une ville, rattachée à une région */
export interface Localite {
  id: string;
  nom: string;
  regionId: string;
}

/** Les trois types de structures qui organisent les ateliers */
export type TypeStructure = 'creche' | 'ecole_prescolaire' | 'centre_social';

/** Une structure d'accueil (crèche, école préscolaire ou centre social) :
 *  elle organise les ateliers des quartiers qu'elle couvre */
export interface Structure {
  id: string;
  nom: string;
  type: TypeStructure;
  localiteId: string;
  /** Nom de l animatrice (facultatif) */
  animatrice?: string;
}

/** Un quartier, rattaché à une localité et couvert par au plus une structure */
export interface Quartier {
  id: string;
  nom: string;
  localiteId: string;
  /** Structure qui couvre ce quartier ('' : aucune pour le moment) */
  structureId: string;
}

/** Un enfant enregistré à la mairie */
export interface Enfant {
  id: string;
  prenom: string;
  nom: string;
  sexe: Sexe;
  /** Date de naissance au format AAAA-MM-JJ */
  dateNaissance: string;
  parentNom: string;
  parentTelephone: string;
  langue: Langue;
  localiteId: string;
  quartierId: string;
  /** Accord du parent pour être contacté par la structure du quartier (toujours vrai) */
  consentement: boolean;
  /** Date d'enregistrement (ISO) */
  dateEnregistrement: string;
}

/** Suivi d'un enfant pour l'atelier d'un mois donné */
export interface Presence {
  enfantId: string;
  /** Mois de l'atelier au format AAAA-MM */
  mois: string;
  appele: boolean;
  confirme: boolean;
  venu: boolean;
}

/** Index de tranche d'âge : 0 = 0-1 an, ..., 4 = 4-5 ans */
export type TrancheId = 0 | 1 | 2 | 3 | 4;

/** Une étape de fabrication : texte + photo facultative */
export interface Etape {
  texte: string;
  /** Image en data URL (compressée) */
  image?: string;
}

/** Un jeu à fabriquer en atelier */
export interface Jeu {
  id: string;
  nom: string;
  /** « video » : un lien vidéo ; « fabrication » : des étapes en images */
  format: 'video' | 'fabrication';
  videoUrl?: string;
  etapes: Etape[];
  /** Comment jouer avec l'enfant */
  utilisation: string;
  /** Ce qu'il faut observer chez l'enfant */
  observer: string;
}

/** Jeux proposés pour chaque tranche d'âge */
export type Ateliers = Record<TrancheId, Jeu[]>;

/** Ensemble des données sauvegardées */
export interface Donnees {
  regions: Region[];
  localites: Localite[];
  structures: Structure[];
  quartiers: Quartier[];
  enfants: Enfant[];
  presences: Presence[];
  ateliers: Ateliers;
}
