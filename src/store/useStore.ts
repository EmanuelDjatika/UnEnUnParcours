import { useCallback, useEffect, useState } from 'react';
import type { Ateliers, Donnees, Enfant, Jeu, Presence, Quartier, Structure, TrancheId } from '../types';
import { donneesVides, genererDemo } from '../data/demo';

const CLE = 'un-enfant-un-parcours-eveil:v2';

/** Lit les données sauvegardées dans le navigateur */
function charger(): Donnees {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      // Données déjà enregistrées sur cet appareil : on les garde telles quelles
      const d = valider(JSON.parse(brut));
      if (d) return d;
    }
  } catch {
    // stockage indisponible (navigation privée…) : on utilise la démonstration
  }
  // Tout premier lancement : 60 enfants de démonstration, aussitôt sauvegardés
  const demo = genererDemo();
  sauvegarder(demo);
  return demo;
}

function sauvegarder(d: Donnees): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(d));
  } catch {
    // on ignore : l'app continue de fonctionner en mémoire
  }
}

/** Vérifie qu'un objet importé a la bonne forme, et complète ce qui manque */
export function valider(x: unknown): Donnees | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Partial<Donnees>;
  if (!Array.isArray(o.enfants) || !Array.isArray(o.quartiers) || !Array.isArray(o.localites)) return null;
  const base = donneesVides();
  // Migration : anciennes données avec « creches » / « crecheId »
  // → les crèches deviennent des structures de type « creche », sans perte
  const ancien = x as { creches?: Array<Omit<Structure, 'type'>> };
  const structures: Structure[] = Array.isArray(o.structures)
    ? o.structures
    : Array.isArray(ancien.creches)
      ? ancien.creches.map((c) => ({ ...c, type: 'creche' as const }))
      : base.structures;
  return {
    regions: Array.isArray(o.regions) ? o.regions : base.regions,
    // anciennes données sans région : on retrouve la région de la ville connue
    localites: o.localites.map((l) => ({ ...l, regionId: l.regionId ?? base.localites.find((b) => b.id === l.id)?.regionId ?? '' })),
    quartiers: o.quartiers.map((q) => {
      const { crecheId, ...reste } = q as Quartier & { crecheId?: string };
      return { ...reste, structureId: q.structureId ?? crecheId ?? '' };
    }),
    structures,
    enfants: o.enfants,
    presences: Array.isArray(o.presences) ? o.presences : [],
    ateliers: nettoyerAteliers(o.ateliers),
  };
}

/** Garde seulement les jeux au nouveau format (les anciens exemples en texte sont retirés), tranches 0 à 4 */
function nettoyerAteliers(a: unknown): Ateliers {
  const res: Ateliers = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  if (!a || typeof a !== 'object') return res;
  for (const t of [0, 1, 2, 3, 4] as TrancheId[]) {
    const l = (a as Record<number, unknown>)[t];
    if (Array.isArray(l)) res[t] = l.filter((j): j is Jeu => !!j && typeof j === 'object' && 'nom' in j);
  }
  return res;
}

function nouvelId(prefixe: string): string {
  return `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** État global de l'application, sauvegardé automatiquement */
export function useStore() {
  const [donnees, setDonnees] = useState<Donnees>(charger);

  // Sauvegarde locale à chaque modification
  useEffect(() => sauvegarder(donnees), [donnees]);

  // Demande au navigateur de ne jamais effacer ces données pour libérer de la place
  useEffect(() => {
    try { void navigator.storage?.persist?.(); } catch { /* non pris en charge */ }
  }, []);

  // Plusieurs onglets ouverts (ex. mairie et crèche) : on relit les données
  // écrites par l'autre onglet, pour ne jamais écraser ses enregistrements
  useEffect(() => {
    const f = (e: StorageEvent) => {
      if (e.key !== CLE || !e.newValue) return;
      try {
        const d = valider(JSON.parse(e.newValue));
        if (d) setDonnees(d);
      } catch { /* valeur illisible : on ignore */ }
    };
    window.addEventListener('storage', f);
    return () => window.removeEventListener('storage', f);
  }, []);

  const ajouterEnfant = useCallback((e: Omit<Enfant, 'id' | 'dateEnregistrement'>) => {
    setDonnees((d) => ({
      ...d,
      enfants: [...d.enfants, { ...e, id: nouvelId('enf'), dateEnregistrement: new Date().toISOString() }],
    }));
  }, []);

  const supprimerEnfant = useCallback((id: string) => {
    setDonnees((d) => ({
      ...d,
      enfants: d.enfants.filter((e) => e.id !== id),
      presences: d.presences.filter((p) => p.enfantId !== id),
    }));
  }, []);

  /** Ajoute un quartier, couvert par une structure existante ou par aucune ('') */
  const ajouterQuartier = useCallback((nom: string, localiteId: string, structureId: string): Quartier => {
    const q: Quartier = { id: nouvelId('q'), nom, localiteId, structureId };
    setDonnees((d) => ({ ...d, quartiers: [...d.quartiers, q] }));
    return q;
  }, []);

  /**
   * Ajoute ou modifie une structure et sa zone de couverture.
   * Un quartier ne peut appartenir qu'à une seule structure : si un quartier
   * demandé est déjà couvert par une autre, rien n'est enregistré et on renvoie
   * la liste des conflits (à afficher dans la page).
   */
  const enregistrerStructure = useCallback((s: Omit<Structure, 'id'> & { id?: string }, quartierIds: string[]): { structure: Structure } | { conflits: { quartier: Quartier; structure: Structure }[] } => {
    const structure: Structure = { ...s, id: s.id ?? nouvelId('st') };
    const conflits = quartierIds.flatMap((qid) => {
      const q = donnees.quartiers.find((x) => x.id === qid);
      const autre = q && q.structureId && q.structureId !== structure.id && donnees.structures.find((x) => x.id === q.structureId);
      return q && autre ? [{ quartier: q, structure: autre }] : [];
    });
    if (conflits.length) return { conflits };
    setDonnees((d) => ({
      ...d,
      structures: d.structures.some((x) => x.id === structure.id)
        ? d.structures.map((x) => (x.id === structure.id ? structure : x))
        : [...d.structures, structure],
      // Quartiers cochés → cette structure ; quartiers décochés → plus couverts
      quartiers: d.quartiers.map((q) =>
        quartierIds.includes(q.id) ? { ...q, structureId: structure.id }
          : q.structureId === structure.id ? { ...q, structureId: '' } : q),
    }));
    return { structure };
  }, [donnees]);

  /** Modifie une case (appelé / confirmé / venu) pour un enfant et un mois */
  const majPresence = useCallback(
    (enfantId: string, mois: string, champ: keyof Pick<Presence, 'appele' | 'confirme' | 'venu'>, valeur: boolean) => {
      setDonnees((d) => {
        const existe = d.presences.find((p) => p.enfantId === enfantId && p.mois === mois);
        const base: Presence = existe ?? { enfantId, mois, appele: false, confirme: false, venu: false };
        const maj = { ...base, [champ]: valeur };
        const autres = d.presences.filter((p) => p !== existe);
        return { ...d, presences: [...autres, maj] };
      });
    },
    [],
  );

  const majAteliers = useCallback((t: TrancheId, jeux: Jeu[]) => {
    setDonnees((d) => ({ ...d, ateliers: { ...d.ateliers, [t]: jeux } as Ateliers }));
  }, []);

  const chargerDemo = useCallback(() => setDonnees(genererDemo()), []);
  const toutEffacer = useCallback(() => setDonnees(donneesVides()), []);
  const remplacer = useCallback((d: Donnees) => setDonnees(d), []);

  return {
    donnees,
    ajouterEnfant,
    supprimerEnfant,
    ajouterQuartier,
    enregistrerStructure,
    majPresence,
    majAteliers,
    chargerDemo,
    toutEffacer,
    remplacer,
  };
}

export type Store = ReturnType<typeof useStore>;
