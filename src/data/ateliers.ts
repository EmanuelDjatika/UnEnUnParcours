import type { Ateliers, Jeu, TrancheId } from '../types';

/** Jeux fournis d'office à toutes les structures (la structure peut en ajouter ou en retirer dans l'onglet « Jeux ») */
export const JEUX_PAR_DEFAUT: { tranche: TrancheId; jeu: Jeu }[] = [
  {
    tranche: 1,
    jeu: {
      id: 'defaut-balle-au-trou',
      nom: 'Balle au trou léger',
      format: 'video',
      videoUrl: 'https://youtu.be/6vwjujZRm5Y',
      etapes: [],
      utilisation: [
        "Asseyez-vous face à l'enfant, le jeu posé entre vous.",
        'Montrez-lui comment faire entrer la balle dans le trou.',
        "Donnez-lui la balle et laissez-le essayer, sans faire à sa place.",
        "Nommez ce qu'il fait : « la balle est entrée », « elle a disparu ! ».",
        "Recommencez autant qu'il en a envie, et félicitez chaque essai.",
      ].join('\n'),
      observer: [
        'Il saisit la balle et la lâche volontairement',
        'Il vise le trou et ajuste son geste',
        'Il cherche la balle quand elle disparaît',
        'Il réagit aux mots et essaie de les répéter',
        'Il prend plaisir à recommencer',
      ].join('\n'),
      competences: ['motricite_fine', 'patience', 'coordination'],
      materiel: [
        'Une boîte en carton',
        'Une balle légère (papier froissé, chaussette roulée…)',
        'Ciseaux ou cutter (réservés à l’adulte)',
        'Ruban adhésif ou colle',
      ],
    },
  },
];

/** Jeux par tranche d'âge au départ : les jeux par défaut ci-dessus */
export const ATELIERS_PAR_DEFAUT: Ateliers = (() => {
  const a: Ateliers = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const { tranche, jeu } of JEUX_PAR_DEFAUT) a[tranche].push(jeu);
  return a;
})();
