import { useState } from 'react';
import type { Store } from '../store/useStore';
import type { Enfant } from '../types';
import GraphiqueBarres from '../components/GraphiqueBarres';
import FiltrePastille from '../components/FiltrePastille';
import type { Barre } from '../components/GraphiqueBarres';
import { TRANCHES, estPrescolaire, libelleTranche, trancheA } from '../utils/age';
import EtiquetteStructure, { LISTE_TYPES, TYPES_STRUCTURE, nomCourt, resumeTypes } from '../components/EtiquetteStructure';

const SEXES = [
  { nom: 'Filles', couleur: 'var(--orange)' },
  { nom: 'Garçons', couleur: '#C7C7CC' },
];
const ACCENT = 'var(--orange)';

/** Anneau de progression (style « anneaux d'activité ») */
function Anneau({ valeur, couleur, taille = 120 }: { valeur: number; couleur: string; taille?: number }) {
  const e = 12;
  const r = (taille - e) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} className="anneau" aria-hidden="true">
      <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" stroke={couleur} strokeOpacity={0.15} strokeWidth={e} />
      <circle cx={taille / 2} cy={taille / 2} r={r} fill="none" stroke={couleur} strokeWidth={e} strokeLinecap="round"
        strokeDasharray={`${(Math.min(100, valeur) / 100) * c} ${c}`} transform={`rotate(-90 ${taille / 2} ${taille / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="anneau-valeur">{valeur}%</text>
    </svg>
  );
}

/** Écran 3 : indicateurs pour la mairie et l'UNICEF */

interface Props {
  store: Store;
  /** Absent : pas de bouton « Enregistrer » (ex. administration) */
  onEnregistrer?: () => void;
  /** Absent : pas d'accès aux structures et ateliers (ex. mairie) */
  onStructures?: () => void;
  /** Compte mairie : tableau limité à sa ville */
  villeFixe?: string;
  /** Ouvre la liste des enfants (option : seulement ceux à orienter vers le préscolaire) */
  onEnfants: (prescolaire: boolean) => void;
}

export default function TableauDeBord({ store, onEnregistrer, onStructures, onEnfants, villeFixe }: Props) {
  const { enfants: tous, regions, localites, quartiers, structures, presences } = store.donnees;
  // Filtres du tableau de bord
  const [regionId, setRegionId] = useState('');
  const [localiteId, setLocaliteId] = useState(villeFixe ?? '');
  const [quartierId, setQuartierId] = useState('');
  const [sexe, setSexe] = useState('');
  const [tranche, setTranche] = useState('');
  // Type de la structure qui couvre le quartier de l'enfant ('' : tous)
  const [typeStructure, setTypeStructure] = useState('');
  const auj = new Date();
  const nbFiltres = [regionId, villeFixe ? '' : localiteId, quartierId, sexe, tranche, typeStructure].filter(Boolean).length;
  const effacerFiltres = () => { setRegionId(''); setLocaliteId(villeFixe ?? ''); setQuartierId(''); setSexe(''); setTranche(''); setTypeStructure(''); };

  const regionDe = (villeId: string) => localites.find((l) => l.id === villeId)?.regionId;
  const typeDuQuartier = (qid: string) => structures.find((s) => s.id === quartiers.find((q) => q.id === qid)?.structureId)?.type;
  const villesRegion = localites.filter((l) => !regionId || l.regionId === regionId);
  const enfants = tous.filter((e) =>
    (!regionId || regionDe(e.localiteId) === regionId) &&
    (!localiteId || e.localiteId === localiteId) &&
    (!quartierId || e.quartierId === quartierId) &&
    (!sexe || e.sexe === sexe) &&
    (!tranche || trancheA(e.dateNaissance, auj) === Number(tranche)) &&
    (!typeStructure || typeDuQuartier(e.quartierId) === typeStructure));
  const structureDuQuartier = quartiers.find((q) => q.id === quartierId)?.structureId;
  const structuresVues = structures.filter((c) => (!regionId || regionDe(c.localiteId) === regionId) && (!localiteId || c.localiteId === localiteId)
    && (!quartierId || c.id === structureDuQuartier) && (!typeStructure || c.type === typeStructure));
  const ids = new Set(enfants.map((e) => e.id));
  const presencesVues = presences.filter((p) => ids.has(p.enfantId));

  const parSexe = (l: Enfant[]) => [l.filter((e) => e.sexe === 'F').length, l.filter((e) => e.sexe === 'M').length];
  const filles = enfants.filter((e) => e.sexe === 'F').length;

  const barresLieu: Barre[] = (localiteId ? quartiers.filter((q) => q.localiteId === localiteId) : villesRegion).map((x) => ({
    libelle: x.nom,
    valeurs: parSexe(enfants.filter((e) => (localiteId ? e.quartierId : e.localiteId) === x.id)),
  })).filter((b) => b.valeurs[0] + b.valeurs[1] > 0);

  const parTranche = TRANCHES.map((t) => {
    const l = enfants.filter((e) => trancheA(e.dateNaissance, auj) === t);
    return { t, f: l.filter((e) => e.sexe === 'F').length, m: l.filter((e) => e.sexe === 'M').length };
  });
  const maxTranche = Math.max(1, ...parTranche.map((x) => x.f + x.m));

  // Participation : venus / familles contactées
  const taux = (ps: typeof presences) => {
    const suivis = ps.filter((p) => p.appele || p.confirme || p.venu);
    return { suivis: suivis.length, venus: suivis.filter((p) => p.venu).length, pct: suivis.length ? Math.round((suivis.filter((p) => p.venu).length / suivis.length) * 100) : 0 };
  };
  const global = taux(presencesVues);
  const participation = structuresVues.map((c) => {
    const idsC = new Set(enfants.filter((e) => quartiers.find((q) => q.id === e.quartierId)?.structureId === c.id).map((e) => e.id));
    return { structure: c, ...taux(presences.filter((p) => idsC.has(p.enfantId))) };
  });

  const prescolaire = enfants.filter((e) => estPrescolaire(e.dateNaissance, auj)).length;

  // Indicateurs propres à la mairie : les naissances enregistrées
  const debutMois = new Date(auj.getFullYear(), auj.getMonth(), 1).getTime();
  const ceMois = enfants.filter((e) => new Date(e.dateEnregistrement).getTime() >= debutMois).length;
  const moinsDunAn = enfants.filter((e) => trancheA(e.dateNaissance, auj) === 0).length;

  const tuiles = villeFixe ? [
    { valeur: enfants.length, libelle: 'Enfants enregistrés', detail: `${filles} filles · ${enfants.length - filles} garçons`, couleur: 'var(--texte)', action: () => onEnfants(false) },
    { valeur: ceMois, libelle: 'Enregistrés ce mois-ci', detail: auj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), couleur: 'var(--texte)', action: undefined },
    { valeur: moinsDunAn, libelle: 'Nourrissons (0-1 an)', detail: 'Nés dans les 12 derniers mois', couleur: 'var(--texte)', action: undefined },
    { valeur: new Set(enfants.map((e) => e.quartierId)).size, libelle: 'Quartiers couverts', detail: 'Avec au moins un enfant enregistré', couleur: 'var(--texte)', action: undefined },
  ] : [
    { valeur: enfants.length, libelle: 'Enfants enregistrés', detail: `${filles} filles · ${enfants.length - filles} garçons`, couleur: 'var(--texte)', action: () => onEnfants(false) },
    { valeur: `${global.pct}%`, libelle: 'Participation aux ateliers', detail: `${global.venus} venus sur ${global.suivis} familles contactées`, couleur: 'var(--texte)', action: onStructures },
    { valeur: prescolaire, libelle: 'À orienter vers le préscolaire', detail: 'Enfants de 3 ans et plus', couleur: 'var(--texte)', action: () => onEnfants(true) },
    { valeur: structuresVues.length, libelle: 'Structures partenaires', detail: resumeTypes(structuresVues), couleur: 'var(--texte)', action: onStructures },
  ];

  return (
    <div className="page tdb">
      <header className="tdb-tete">
        <div>
          <p className="tdb-date">{auj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h2 className="tdb-titre">Aperçu</h2>
        </div>
      </header>

      {/* Barre de filtres : chaque pastille est une liste déroulante */}
      <section className="tri" aria-label="Filtres">
        <div className="tri-pastilles">
          {!villeFixe && <>
          <FiltrePastille libelle="Région" valeur={regionId} tous="Toutes"
            options={regions.map((r) => ({ id: r.id, nom: r.nom }))}
            onChange={(v) => { setRegionId(v); setLocaliteId(''); setQuartierId(''); }} />
          <FiltrePastille libelle="Ville" valeur={localiteId} tous="Toutes"
            options={villesRegion.map((l) => ({ id: l.id, nom: l.nom }))}
            onChange={(v) => { setLocaliteId(v); setQuartierId(''); }} />
          </>}
          <FiltrePastille libelle="Quartier" valeur={quartierId} tous="Tous"
            options={quartiers.filter((q) => (localiteId ? q.localiteId === localiteId : villesRegion.some((l) => l.id === q.localiteId))).map((q) => ({ id: q.id, nom: q.nom }))}
            onChange={setQuartierId} />
          <FiltrePastille libelle="Sexe" valeur={sexe} tous="Tous"
            options={[{ id: 'F', nom: 'Filles' }, { id: 'M', nom: 'Garçons' }]} onChange={setSexe} />
          <FiltrePastille libelle="Âge" valeur={tranche} tous="Tous"
            options={TRANCHES.map((t) => ({ id: String(t), nom: libelleTranche(t) }))} onChange={setTranche} />
          <FiltrePastille libelle="Type de structure" valeur={typeStructure} tous="Toutes"
            options={LISTE_TYPES.map((t) => ({ id: t, nom: TYPES_STRUCTURE[t].libelle }))} onChange={setTypeStructure} />
        </div>
        <div className="tri-resume">
          <span><strong>{enfants.length}</strong> enfant{enfants.length > 1 ? 's' : ''}{nbFiltres ? ` · ${nbFiltres} filtre${nbFiltres > 1 ? 's' : ''}` : ''}</span>
          {nbFiltres > 0 && <button className="tri-effacer" onClick={effacerFiltres}>Effacer</button>}
        </div>
      </section>

      {/* Action principale, bien en évidence */}
      {onEnregistrer && <div className="tdb-actions">
        {onEnregistrer && <button className="tdb-cta" onClick={onEnregistrer}>
          <span className="tdb-cta-plus" aria-hidden="true">
            {/* Croix dessinée en SVG : parfaitement centrée, quelle que soit la police */}
            <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 3v16M3 11h16" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
          </span>
          <span>
            <strong>Enregistrer un enfant</strong>
            <small>Nouvelle naissance, avec l'accord du parent</small>
          </span>
        </button>}
      </div>}

      {tous.length === 0 && <p className="tdb-vide">Aucune donnée pour l'instant. Chargez la démonstration ou enregistrez un enfant.</p>}

      <div className="tdb-tuiles">
        {tuiles.map((t) => (
          <button key={t.libelle} className="tdb-tuile" onClick={t.action} disabled={!t.action}>
            {t.action && <span className="tdb-fleche" aria-hidden="true">›</span>}
            <span className="tdb-libelle">{t.libelle}</span>
            <strong style={{ color: t.couleur }}>{t.valeur}</strong>
            <span className="tdb-detail">{t.detail}</span>
          </button>
        ))}
      </div>

      {!villeFixe && <section className="tdb-carte">
        <div className="tdb-carte-tete">
          <h3>Participation par structure</h3>
          <span className="tdb-detail">Venus / familles contactées</span>
        </div>
        <div className="tdb-anneaux">
          {participation.map((p) => (
            <div key={p.structure.id} className="tdb-anneau">
              <Anneau valeur={p.pct} couleur={ACCENT} />
              <strong>{nomCourt(p.structure.nom)}</strong>
              <EtiquetteStructure type={p.structure.type} />
              <span className="tdb-detail">{p.venus} / {p.suivis}</span>
            </div>
          ))}
        </div>
      </section>}

      <div className="tdb-grille">
        <section className="tdb-carte">
          <div className="tdb-carte-tete">
            <h3>Âges aujourd'hui</h3>
            <div className="legende">{SEXES.map((s) => <span key={s.nom}><i style={{ background: s.couleur }} />{s.nom}</span>)}</div>
          </div>
          <div className="colonnes">
            {parTranche.map(({ t, f, m }) => (
              <div key={t} className="colonne">
                <span className="colonne-total">{f + m}</span>
                <div className="colonne-piste">
                  <div className="colonne-barre" style={{ height: `${((f + m) / maxTranche) * 100}%` }}>
                    <div style={{ flex: m, background: '#C7C7CC' }} title={`${m} garçons`} />
                    <div style={{ flex: f, background: 'var(--orange)' }} title={`${f} filles`} />
                  </div>
                </div>
                <span className="colonne-libelle">{libelleTranche(t)}</span>
              </div>
            ))}
          </div>
        </section>

        <GraphiqueBarres titre={localiteId ? 'Enfants par quartier' : 'Enfants par ville'} barres={barresLieu} series={SEXES} />
      </div>
    </div>
  );
}
