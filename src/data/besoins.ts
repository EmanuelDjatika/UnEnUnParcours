import type { CompetenceId, TrancheId } from '../types';

/** Un besoin de l'enfant à un âge donné, rattaché à un domaine du développement */
export interface Besoin {
  competence: CompetenceId;
  texte: string;
}

/**
 * Les besoins principaux de l'enfant à chaque âge.
 * Un jeu répond à un besoin quand il travaille la même capacité (Jeu.competences).
 */
export const BESOINS: Record<TrancheId, Besoin[]> = {
  0: [
    { competence: 'sens', texte: 'Voir des contrastes, entendre des sons, toucher des matières.' },
    { competence: 'motricite_globale', texte: 'Tenir sa tête, se retourner, ramper puis s’asseoir.' },
    { competence: 'motricite_fine', texte: 'Attraper un objet et le passer d’une main à l’autre.' },
    { competence: 'relation', texte: 'Se sentir en sécurité dans les bras et le regard de l’adulte.' },
  ],
  1: [
    { competence: 'motricite_fine', texte: 'Saisir, lâcher, faire entrer un objet dans un trou.' },
    { competence: 'coordination', texte: 'Guider sa main avec ses yeux pour viser juste.' },
    { competence: 'patience', texte: 'Recommencer un geste jusqu’à le réussir.' },
    { competence: 'langage', texte: 'Dire ses premiers mots, montrer du doigt ce qu’il veut.' },
  ],
  2: [
    { competence: 'langage', texte: 'Nommer les objets et faire de petites phrases.' },
    { competence: 'reflexion', texte: 'Trier par couleur, par forme et par taille.' },
    { competence: 'motricite_fine', texte: 'Tenir un crayon, enfiler, tourner les pages.' },
    { competence: 'relation', texte: 'Imiter l’adulte et jouer à faire semblant.' },
  ],
  3: [
    { competence: 'reflexion', texte: 'Compter jusqu’à cinq, comparer grand et petit.' },
    { competence: 'coordination', texte: 'Assembler et empiler sans tout faire tomber.' },
    { competence: 'langage', texte: 'Raconter ce qu’il a fait, poser des questions.' },
    { competence: 'relation', texte: 'Jouer avec les autres et attendre son tour.' },
  ],
  4: [
    { competence: 'reflexion', texte: 'Reconnaître les nombres et les formes, faire un puzzle.' },
    { competence: 'motricite_fine', texte: 'Découper, dessiner, préparer la main à l’écriture.' },
    { competence: 'langage', texte: 'Reconnaître des lettres, raconter une histoire.' },
    { competence: 'patience', texte: 'Rester concentré sur une activité jusqu’au bout.' },
  ],
};
