import type React from 'react';
import { useState } from 'react';
import type { Store } from '../store/useStore';
import type { Enfant, TrancheId } from '../types';
import ListeAppels from '../components/ListeAppels';
import { TRANCHES, dateAtelier, estPrescolaire, libelleMois, libelleTranche, moisCourant, trancheA, texteAge } from '../utils/age';
import FiltrePastille from '../components/FiltrePastille';
import IllustrationAge from '../components/IllustrationAge';
import EtiquetteStructure, { LISTE_TYPES, TYPES_STRUCTURE, nomCourt } from '../components/EtiquetteStructure';
import GestionStructures from '../components/GestionStructures';
import InvitationSMS from '../components/InvitationSMS';


/** Dégradé d'orange : plus l'enfant grandit, plus la teinte est profonde */
const COULEURS_AGES = ['#F2B254', '#EC9A2E', '#E07B00', '#C76A00', '#A85700'];

/** Décale un mois « AAAA-MM » de n mois */
function decaler(mois: string, n: number): string {
  const [a, m] = mois.split('-').map(Number);
  const d = new Date(a, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Écran 2 : la structure (crèche, école préscolaire ou centre social)
 * prépare ses ateliers et appelle les familles de sa zone.
 * structureFixe : compte structure, seule sa structure est visible.
 */
export default function Structures({ store, structureFixe }: { store: Store; structureFixe?: string }) {
  const { regions, localites, quartiers, structures, enfants, presences, ateliers, invitations } = store.donnees;
  // Ville de départ : celle de la structure du compte, sinon la première
  const villeDepart = localites.find((l) => l.id === structures.find((c) => c.id === structureFixe)?.localiteId) ?? localites[0];
  const [regionId, setRegionId] = useState(villeDepart?.regionId ?? '');
  const villesRegion = localites.filter((l) => l.regionId === regionId);
  const [localiteId, setLocaliteId] = useState(villeDepart?.id ?? '');
  // Filtre « Type de structure » ('' : toutes)
  const [typeFiltre, setTypeFiltre] = useState('');
  const [gestion, setGestion] = useState(false);
  // Fenêtre « Inviter des parents par SMS »
  const [invitation, setInvitation] = useState(false);
  // Par défaut : première structure de la localité, pour voir tout de suite une liste
  const premiereStructure = (loc: string, type = typeFiltre) => structures.find((c) => c.localiteId === loc && (!type || c.type === type))?.id ?? '';
  const [structureId, setStructureId] = useState(() => structureFixe ?? premiereStructure(villeDepart?.id ?? ''));
  const [quartierId, setQuartierId] = useState('');
  const [mois, setMois] = useState(moisCourant());

  const structuresLoc = structures.filter((c) => c.localiteId === localiteId && (!typeFiltre || c.type === typeFiltre));
  // Quartiers de la ville couverts par la structure choisie (ou par une structure du type choisi)
  const quartiersLoc = quartiers.filter((q) => q.localiteId === localiteId && (structureId ? q.structureId === structureId : !typeFiltre || structuresLoc.some((s) => s.id === q.structureId)));
  const ref = dateAtelier(mois);

  // Quartiers concernés : le quartier choisi, ou tous ceux de la structure
  const quartiersCibles = quartierId ? quartiers.filter((q) => q.id === quartierId) : structureId ? quartiersLoc : [];
  const idsCibles = new Set(quartiersCibles.map((q) => q.id));
  const structure = structures.find((c) => c.id === (structureId || quartiersCibles[0]?.structureId));

  // Regroupement automatique par tranche d'âge à la date de l'atelier
  const groupes = new Map<TrancheId, Enfant[]>(TRANCHES.map((t) => [t, []]));
  for (const e of enfants) {
    if (!idsCibles.has(e.quartierId) || !e.consentement) continue;
    const t = trancheA(e.dateNaissance, ref);
    if (t !== null) groupes.get(t)!.push(e);
  }
  for (const liste of groupes.values()) liste.sort((a, b) => a.dateNaissance.localeCompare(b.dateNaissance));

  const total = [...groupes.values()].reduce((a, l) => a + l.length, 0);
  // Indicateurs de la structure pour le mois choisi
  const tousEnfants = [...groupes.values()].flat();
  // Enfants reçus de la mairie depuis moins de 30 jours (tous âges 0-5 ans du périmètre)
  const limite = Date.now() - 30 * 86400000;
  const nouveaux = enfants
    .filter((e) => idsCibles.has(e.quartierId) && new Date(e.dateEnregistrement).getTime() >= limite)
    .sort((a, b) => b.dateEnregistrement.localeCompare(a.dateEnregistrement));
  const nomQuartierDe = (id: string) => quartiers.find((q) => q.id === id)?.nom ?? '';
  const pr = (id: string) => presences.find((x) => x.enfantId === id && x.mois === mois);
  const nbInvites = tousEnfants.filter((e) => pr(e.id)?.invite).length;
  const nbAppeles = tousEnfants.filter((e) => pr(e.id)?.appele).length;
  const nbConfirmes = tousEnfants.filter((e) => pr(e.id)?.confirme).length;
  const nbVenus = tousEnfants.filter((e) => pr(e.id)?.venu).length;
  const nbPresco = tousEnfants.filter((e) => estPrescolaire(e.dateNaissance, ref)).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const etapes = [
    { libelle: 'À inviter', valeur: total },
    { libelle: 'Invités par SMS', valeur: nbInvites },
    { libelle: 'Appelés', valeur: nbAppeles },
    { libelle: 'Ont confirmé', valeur: nbConfirmes },
    { libelle: 'Sont venus', valeur: nbVenus },
  ];
  const maxGroupe = Math.max(1, ...TRANCHES.map((t) => groupes.get(t)!.length));
  // Dernières campagnes d'invitations SMS qui concernent ces quartiers
  const dernieresInvitations = invitations.filter((inv) => inv.quartierIds.some((id) => idsCibles.has(id))).slice(-3).reverse();


  return (
    <div className="page tdb creches">
      {/* Bandeau illustré de la structure */}
      <header className="hero hero-creche non-imprime">
        <div className="hero-texte">
          <span className="hero-etiquette">{structure ? nomCourt(structure.nom) : "Structures et ateliers"}</span>
          {structure && <EtiquetteStructure type={structure.type} />}
          <h1>Un enfant,<br />un parcours d'éveil</h1>
          <p>De la naissance au préscolaire, par le jeu</p>
        </div>
        <img className="hero-image" src="/creche-hero.png" alt="Des enfants jouent aux cubes avec une animatrice" />
      </header>
      {/* Sélection : localité, type, structure, quartier, mois */}
      <section className="tri non-imprime" aria-label="Sélection">
        <div className="tri-pastilles">
          {!structureFixe && <>
          <FiltrePastille libelle="Région" valeur={regionId}
            options={regions.map((r) => ({ id: r.id, nom: r.nom }))}
            onChange={(r) => { const v = localites.find((l) => l.regionId === r)?.id ?? ''; setRegionId(r); setLocaliteId(v); setStructureId(premiereStructure(v)); setQuartierId(''); }} />
          <FiltrePastille libelle="Ville" valeur={localiteId} tous={villesRegion.length ? undefined : 'Aucune'}
            options={villesRegion.map((l) => ({ id: l.id, nom: l.nom }))}
            onChange={(v) => { setLocaliteId(v); setStructureId(premiereStructure(v)); setQuartierId(''); }} />
          <FiltrePastille libelle="Type de structure" valeur={typeFiltre} tous="Toutes"
            options={LISTE_TYPES.map((t) => ({ id: t, nom: TYPES_STRUCTURE[t].libelle }))}
            onChange={(t) => { setTypeFiltre(t); setStructureId(premiereStructure(localiteId, t)); setQuartierId(''); }} />
          <FiltrePastille libelle="Structure" valeur={structureId} tous="Toutes"
            options={structuresLoc.map((c) => ({ id: c.id, nom: nomCourt(c.nom) }))}
            onChange={(v) => { setStructureId(v); setQuartierId(''); }} />
          </>}
          <FiltrePastille libelle="Quartier" valeur={quartierId} tous={structureId ? 'Tous' : 'Choisir'}
            options={quartiersLoc.map((q) => ({ id: q.id, nom: q.nom }))} onChange={setQuartierId} />
        </div>
        <div className="mois-pas" role="group" aria-label="Mois de l'atelier">
          <button onClick={() => setMois(decaler(mois, -1))} aria-label="Mois précédent">‹</button>
          <span>{libelleMois(mois)}</span>
          <button onClick={() => setMois(decaler(mois, 1))} aria-label="Mois suivant">›</button>
        </div>
        {!structureFixe && <button className="tri-effacer" onClick={() => setGestion(true)}>Gérer les structures</button>}
      </section>
      {gestion && <GestionStructures store={store} onFermer={() => setGestion(false)} />}
      {invitation && <InvitationSMS store={store} structureFixe={structureFixe} localiteDepart={localiteId} mois={mois} onFermer={() => setInvitation(false)} />}

      {structureFixe && !structure && <p className="tdb-vide">Cette structure n'existe pas dans les données de cet appareil.</p>}
      {quartiersCibles.length === 0 ? (
        <p className="tdb-vide">{structureFixe ? "Aucun quartier n'est couvert par cette structure." : 'Choisissez une structure ou un quartier.'}</p>
      ) : (
        <>
          {/* Inviter les familles par SMS + dernières invitations */}
          <div className="inv-entete non-imprime">
            <button className="tdb-cta" onClick={() => setInvitation(true)}>
              <span className="tdb-cta-plus" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 3.5V17.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /><path d="M7 10h10M7 13h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </span>
              <span>
                <strong>Inviter des parents</strong>
                <small>Par SMS, selon l'âge et le quartier</small>
              </span>
            </button>
            {dernieresInvitations.length > 0 && (
              <section className="inv-historique">
                <h3>Dernières invitations</h3>
                <ul>
                  {dernieresInvitations.map((inv) => (
                    <li key={inv.id}>
                      <strong>{inv.enfantIds.length} SMS</strong>
                      <span className="tdb-detail">
                        envoyés le {new Date(inv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {' · '}{inv.tranches.length === TRANCHES.length ? 'tous âges' : inv.tranches.map(libelleTranche).join(', ')}
                        {' · '}{inv.quartierIds.map(nomQuartierDe).join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

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

          {/* Tableau de bord de la structure */}
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
            <h2>{structure?.nom ?? 'Structure'} — atelier de {libelleMois(mois)}</h2>
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
