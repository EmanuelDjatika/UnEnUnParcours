import type React from 'react';
import { useState } from 'react';
import type { Store } from '../store/useStore';
import type { Enfant, TrancheId } from '../types';
import ListeAppels from '../components/ListeAppels';
import { TRANCHES, dateAtelier, estPrescolaire, libelleMois, libelleTranche, moisCourant, trancheA, texteAge } from '../utils/age';
import FiltrePastille from '../components/FiltrePastille';
import IllustrationAge from '../components/IllustrationAge';

/** « Crèche Les Petits Pas (Bè-Tokoin) » → « Les Petits Pas » */
const nomCourt = (nom: string) => nom.replace(/^Crèche\s*/, '').replace(/\s*\(.*\)$/, '') || nom;

/** Dégradé d'orange : plus l'enfant grandit, plus la teinte est profonde */
const COULEURS_AGES = ['#F2B254', '#EC9A2E', '#E07B00', '#C76A00', '#A85700'];

/** Décale un mois « AAAA-MM » de n mois */
function decaler(mois: string, n: number): string {
  const [a, m] = mois.split('-').map(Number);
  const d = new Date(a, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Écran 2 : la crèche prépare ses ateliers et appelle les familles */
/** crecheFixe : compte crèche, seule sa crèche est visible */
export default function Creches({ store, crecheFixe }: { store: Store; crecheFixe?: string }) {
  const { regions, localites, quartiers, creches, enfants, presences, ateliers } = store.donnees;
  // Ville de départ : celle de la crèche du compte, sinon la première
  const villeDepart = localites.find((l) => l.id === creches.find((c) => c.id === crecheFixe)?.localiteId) ?? localites[0];
  const [regionId, setRegionId] = useState(villeDepart?.regionId ?? '');
  const villesRegion = localites.filter((l) => l.regionId === regionId);
  const [localiteId, setLocaliteId] = useState(villeDepart?.id ?? '');
  // Par défaut : première crèche de la localité, pour voir tout de suite une liste
  const premiereCreche = (loc: string) => creches.find((c) => c.localiteId === loc)?.id ?? '';
  const [crecheId, setCrecheId] = useState(() => crecheFixe ?? premiereCreche(localites[0]?.id ?? ''));
  const [quartierId, setQuartierId] = useState('');
  const [mois, setMois] = useState(moisCourant());

  const crechesLoc = creches.filter((c) => c.localiteId === localiteId);
  const quartiersLoc = quartiers.filter((q) => q.localiteId === localiteId && (!crecheId || q.crecheId === crecheId));
  const ref = dateAtelier(mois);

  // Quartiers concernés : le quartier choisi, ou tous ceux de la crèche
  const quartiersCibles = quartierId ? quartiers.filter((q) => q.id === quartierId) : crecheId ? quartiersLoc : [];
  const idsCibles = new Set(quartiersCibles.map((q) => q.id));
  const creche = creches.find((c) => c.id === (crecheId || quartiersCibles[0]?.crecheId));

  // Regroupement automatique par tranche d'âge à la date de l'atelier
  const groupes = new Map<TrancheId, Enfant[]>(TRANCHES.map((t) => [t, []]));
  for (const e of enfants) {
    if (!idsCibles.has(e.quartierId) || !e.consentement) continue;
    const t = trancheA(e.dateNaissance, ref);
    if (t !== null) groupes.get(t)!.push(e);
  }
  for (const liste of groupes.values()) liste.sort((a, b) => a.dateNaissance.localeCompare(b.dateNaissance));

  const total = [...groupes.values()].reduce((a, l) => a + l.length, 0);
  // Indicateurs de la crèche pour le mois choisi
  const tousEnfants = [...groupes.values()].flat();
  // Enfants reçus de la mairie depuis moins de 30 jours (tous âges 0-5 ans du périmètre)
  const limite = Date.now() - 30 * 86400000;
  const nouveaux = enfants
    .filter((e) => idsCibles.has(e.quartierId) && new Date(e.dateEnregistrement).getTime() >= limite)
    .sort((a, b) => b.dateEnregistrement.localeCompare(a.dateEnregistrement));
  const nomQuartierDe = (id: string) => quartiers.find((q) => q.id === id)?.nom ?? '';
  const pr = (id: string) => presences.find((x) => x.enfantId === id && x.mois === mois);
  const nbAppeles = tousEnfants.filter((e) => pr(e.id)?.appele).length;
  const nbConfirmes = tousEnfants.filter((e) => pr(e.id)?.confirme).length;
  const nbVenus = tousEnfants.filter((e) => pr(e.id)?.venu).length;
  const nbPresco = tousEnfants.filter((e) => estPrescolaire(e.dateNaissance, ref)).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const etapes = [
    { libelle: 'À inviter', valeur: total },
    { libelle: 'Appelés', valeur: nbAppeles },
    { libelle: 'Ont confirmé', valeur: nbConfirmes },
    { libelle: 'Sont venus', valeur: nbVenus },
  ];
  const maxGroupe = Math.max(1, ...TRANCHES.map((t) => groupes.get(t)!.length));


  return (
    <div className="page tdb creches">
      {/* Bandeau illustré de la crèche */}
      <header className="hero hero-creche non-imprime">
        <div className="hero-texte">
          <span className="hero-etiquette">{creche ? `Crèche ${nomCourt(creche.nom)}` : "Ateliers d'éveil"}</span>
          <h1>Un enfant,<br />un parcours d'éveil</h1>
          <p>De la naissance au préscolaire, par le jeu</p>
        </div>
        <img className="hero-image" src="/creche-hero.png" alt="Des enfants jouent aux cubes à la crèche avec une animatrice" />
      </header>
      {/* Sélection : localité, crèche, quartier, mois */}
      <section className="tri non-imprime" aria-label="Sélection">
        <div className="tri-pastilles">
          {!crecheFixe && <>
          <FiltrePastille libelle="Région" valeur={regionId}
            options={regions.map((r) => ({ id: r.id, nom: r.nom }))}
            onChange={(r) => { const v = localites.find((l) => l.regionId === r)?.id ?? ''; setRegionId(r); setLocaliteId(v); setCrecheId(premiereCreche(v)); setQuartierId(''); }} />
          <FiltrePastille libelle="Ville" valeur={localiteId} tous={villesRegion.length ? undefined : 'Aucune'}
            options={villesRegion.map((l) => ({ id: l.id, nom: l.nom }))}
            onChange={(v) => { setLocaliteId(v); setCrecheId(premiereCreche(v)); setQuartierId(''); }} />
          <FiltrePastille libelle="Crèche" valeur={crecheId} tous="Toutes"
            options={crechesLoc.map((c) => ({ id: c.id, nom: nomCourt(c.nom) }))}
            onChange={(v) => { setCrecheId(v); setQuartierId(''); }} />
          </>}
          <FiltrePastille libelle="Quartier" valeur={quartierId} tous={crecheId ? 'Tous' : 'Choisir'}
            options={quartiersLoc.map((q) => ({ id: q.id, nom: q.nom }))} onChange={setQuartierId} />
        </div>
        <div className="mois-pas" role="group" aria-label="Mois de l'atelier">
          <button onClick={() => setMois(decaler(mois, -1))} aria-label="Mois précédent">‹</button>
          <span>{libelleMois(mois)}</span>
          <button onClick={() => setMois(decaler(mois, 1))} aria-label="Mois suivant">›</button>
        </div>
      </section>


      {quartiersCibles.length === 0 ? (
        <p className="tdb-vide">Choisissez une crèche ou un quartier.</p>
      ) : (
        <>
          {/* Enfants transmis automatiquement par la mairie (30 derniers jours) */}
          {nouveaux.length > 0 && (
            <section className="transmis non-imprime">
              <div className="tdb-carte-tete">
                <h3>Nouveaux enfants transmis par la mairie</h3>
                <span className="tdb-detail">30 derniers jours</span>
              </div>
              <ul>
                {nouveaux.map((e) => (
                  <li key={e.id}>
                    <span className="badge-nouveau">Nouveau</span>
                    <strong>{e.prenom} {e.nom}</strong>
                    <span className="tdb-detail">{nomQuartierDe(e.quartierId)} · {texteAge(e.dateNaissance, new Date())} · reçu le {new Date(e.dateEnregistrement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tableau de bord de la crèche */}
          <div className="tdb-tuiles non-imprime">
            <div className="tdb-tuile"><span className="tdb-libelle">Familles à inviter</span><strong>{total}</strong><span className="tdb-detail">âge au {ref.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span></div>
            <div className="tdb-tuile"><span className="tdb-libelle">Appels faits</span><strong>{pct(nbAppeles)}%</strong><span className="tdb-detail">{nbAppeles} familles appelées</span></div>
            <div className="tdb-tuile"><span className="tdb-libelle">Participation</span><strong>{pct(nbVenus)}%</strong><span className="tdb-detail">{nbVenus} enfants venus</span></div>
            <div className="tdb-tuile"><span className="tdb-libelle">Vers le préscolaire</span><strong>{nbPresco}</strong><span className="tdb-detail">enfants de 3 ans et plus</span></div>
          </div>

          {/* KPI par classe d'âge */}
          <section className="non-imprime">
            <h3 className="kpi-titre">Par classe d'âge</h3>
            <div className="kpi-ages">
              {TRANCHES.map((t) => {
                const l = groupes.get(t)!;
                const n = l.length;
                const venus = l.filter((e) => pr(e.id)?.venu).length;
                const p = (x: number) => (n ? Math.round((x / n) * 100) : 0);
                return (
                  <div key={t} className={`kpi-age ${n ? '' : 'vide'}`} style={{ '--c': COULEURS_AGES[t] } as React.CSSProperties}>
                    <div className="kpi-age-tete">
                      <span className="kpi-age-libelle">{libelleTranche(t)}</span>
                      <IllustrationAge tranche={t} couleur={COULEURS_AGES[t]} />
                    </div>
                    <strong className="kpi-age-valeur">{p(venus)}%</strong>
                    <span className="tdb-detail">{venus}/{n} venus</span>
                    <div className="entonnoir-piste kpi-age-barre"><div className="entonnoir-barre" style={{ width: `${p(venus)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="tdb-grille non-imprime">
            <section className="tdb-carte">
              <div className="tdb-carte-tete"><h3>Suivi des appels</h3><span className="tdb-detail">{libelleMois(mois)}</span></div>
              <div className="entonnoir">
                {etapes.map((et) => (
                  <div key={et.libelle} className="entonnoir-ligne">
                    <span className="entonnoir-libelle">{et.libelle}</span>
                    <div className="entonnoir-piste"><div className="entonnoir-barre" style={{ width: `${total ? (et.valeur / total) * 100 : 0}%` }} /></div>
                    <span className="entonnoir-valeur">{et.valeur}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="tdb-carte">
              <div className="tdb-carte-tete"><h3>Enfants par âge</h3><span className="tdb-detail">venus / inscrits</span></div>
              <div className="colonnes">
                {TRANCHES.map((t) => {
                  const l = groupes.get(t)!;
                  const v = l.filter((e) => pr(e.id)?.venu).length;
                  return (
                    <div key={t} className="colonne">
                      <span className="colonne-total">{v}/{l.length}</span>
                      <div className="colonne-piste">
                        <div className="colonne-barre" style={{ height: `${(l.length / maxGroupe) * 100}%`, background: 'rgba(224,123,0,.18)' }}>
                          <div style={{ flex: l.length - v }} />
                          <div style={{ flex: v, background: 'var(--orange)' }} />
                        </div>
                      </div>
                      <span className="colonne-libelle">{libelleTranche(t)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <div className="entete-impression">
            <h2>{creche?.nom ?? 'Crèche'} — atelier de {libelleMois(mois)}</h2>
            <p>Quartier{quartiersCibles.length > 1 ? 's' : ''} : {quartiersCibles.map((q) => q.nom).join(', ')} · {total} enfant{total > 1 ? 's' : ''} à inviter · âge calculé au {ref.toLocaleDateString('fr-FR')}</p>
          </div>
          {TRANCHES.map((t) => (
            <ListeAppels key={t} tranche={t} enfants={groupes.get(t)!} jeux={ateliers[t].map((j) => j.nom)} mois={mois} dateRef={ref}
              presences={presences} onChange={(id, champ, v) => store.majPresence(id, mois, champ, v)} />
          ))}
        </>
      )}
    </div>
  );
}
