import type { Localite, Quartier, Region } from '../types';

interface Props {
  regions: Region[];
  regionId: string;
  onRegion: (id: string) => void;
  localites: Localite[];
  quartiers: Quartier[];
  localiteId: string;
  quartierId: string;
  onLocalite: (id: string) => void;
  onQuartier: (id: string) => void;
  recherche?: string;
  onRecherche?: (t: string) => void;
  /** Masque les filtres Région et Ville (compte mairie) */
  masquerLieu?: boolean;
}

/** Filtres par localité, quartier et (optionnellement) recherche texte */
export default function Filtres({ regions, regionId, onRegion, localites, quartiers, localiteId, quartierId, onLocalite, onQuartier, recherche, onRecherche, masquerLieu }: Props) {
  const villesVisibles = localites.filter((l) => !regionId || l.regionId === regionId);
  const idsVilles = new Set(villesVisibles.map((l) => l.id));
  const quartiersVisibles = quartiers.filter((q) => (localiteId ? q.localiteId === localiteId : idsVilles.has(q.localiteId)));
  return (
    <div className="filtres">
      {onRecherche && (
        <label className="champ">
          <span>Rechercher</span>
          <input type="search" placeholder="Nom, parent, téléphone…" value={recherche} onChange={(e) => onRecherche(e.target.value)} />
        </label>
      )}
      {!masquerLieu && <>
      <label className="champ">
        <span>Région</span>
        <select value={regionId} onChange={(e) => { onRegion(e.target.value); onLocalite(''); onQuartier(''); }}>
          <option value="">Toutes</option>
          {regions.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
        </select>
      </label>
      <label className="champ">
        <span>Ville</span>
        <select value={localiteId} onChange={(e) => { onLocalite(e.target.value); onQuartier(''); }}>
          <option value="">Toutes</option>
          {villesVisibles.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
      </label>
      </>}
      <label className="champ">
        <span>Quartier</span>
        <select value={quartierId} onChange={(e) => onQuartier(e.target.value)}>
          <option value="">Tous</option>
          {quartiersVisibles.map((q) => <option key={q.id} value={q.id}>{q.nom}</option>)}
        </select>
      </label>
    </div>
  );
}
