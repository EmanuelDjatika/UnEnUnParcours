import { useEffect, useRef, useState } from 'react';
import type { Store } from '../store/useStore';
import type { Enfant, Quartier, Structure, TrancheId } from '../types';
import { TRANCHES, dateAtelier, libelleTranche, texteAge, trancheA, versDate } from '../utils/age';

/** Message proposé par défaut ; les mots entre accolades sont remplacés pour chaque famille */
const MODELE =
  "Bonjour {parent}, {enfant} est invité(e) à l'atelier d'éveil du {date} à {heure} ({structure}). " +
  'Répondez OUI pour confirmer.';

/** Mots que l'on peut insérer dans le message */
const CHAMPS = ['parent', 'enfant', 'age', 'date', 'heure', 'structure', 'quartier'] as const;

/** « 2026-11-15 » → « samedi 15 novembre » */
const texteDate = (iso: string) => versDate(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
/** « 09:00 » → « 9 h », « 14:30 » → « 14 h 30 » */
const texteHeure = (h: string) => { const [a, m] = h.split(':'); return `${Number(a)} h${m && m !== '00' ? ` ${m}` : ''}`; };
/** Date du jour + n jours au format AAAA-MM-JJ */
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface Destinataire { e: Enfant; t: TrancheId; q?: Quartier; s?: Structure }

interface Props {
  store: Store;
  /** Compte structure : seuls ses quartiers sont proposés */
  structureFixe?: string;
  /** Ville et mois affichés sur la page au moment de l'ouverture */
  localiteDepart: string;
  mois: string;
  onFermer: () => void;
}

/**
 * Invitation des parents par SMS (envoi simulé) :
 * 1. qui inviter (âge de l'enfant à la date de l'atelier, ville, quartiers) ;
 * 2. la liste des destinataires, triée par âge ou par localité ;
 * 3. le message, personnalisé pour chaque famille.
 */
export default function InvitationSMS({ store, structureFixe, localiteDepart, mois, onFermer }: Props) {
  const { localites, quartiers, structures, enfants, presences } = store.donnees;
  const villeStructure = structures.find((s) => s.id === structureFixe)?.localiteId;
  const [localiteId, setLocaliteId] = useState(villeStructure ?? localiteDepart);

  // Quartiers où un atelier existe : couverts par la structure du compte, ou par une structure
  const quartiersVille = quartiers.filter((q) => q.localiteId === localiteId && (structureFixe ? q.structureId === structureFixe : !!q.structureId));
  const [quartierIds, setQuartierIds] = useState<string[]>(() => quartiersVille.map((q) => q.id));
  const [tranches, setTranches] = useState<TrancheId[]>([...TRANCHES]);

  // Atelier : le 15 du mois affiché (ou plus tard si cette date est passée), à 9 h
  const [date, setDate] = useState(() => {
    const d = dateAtelier(mois);
    const demain = new Date(); demain.setDate(demain.getDate() + 1);
    return isoLocal(d < demain ? demain : d);
  });
  const [heure, setHeure] = useState('09:00');
  const [sansDoublon, setSansDoublon] = useState(true);
  const [tri, setTri] = useState<'age' | 'lieu'>('age');
  const [exclus, setExclus] = useState<Set<string>>(new Set());
  const [modele, setModele] = useState(MODELE);
  const zoneMessage = useRef<HTMLTextAreaElement>(null);

  // Envoi simulé : progression, puis écran de confirmation
  const [etat, setEtat] = useState<'edition' | 'envoi' | 'fini'>('edition');
  const [envoyes, setEnvoyes] = useState(0);
  // Nombre de SMS de la campagne, figé au moment de l'envoi
  const [nbCampagne, setNbCampagne] = useState(0);

  const ref = versDate(date);
  const moisInvit = date.slice(0, 7);
  const dejaInvite = (id: string) => presences.some((p) => p.enfantId === id && p.mois === moisInvit && p.invite);

  // Familles concernées par les filtres
  const candidats: Destinataire[] = enfants
    .filter((e) => e.consentement && quartierIds.includes(e.quartierId) && !(sansDoublon && dejaInvite(e.id)))
    .flatMap((e) => {
      // Âge calculé le jour de l'atelier ; hors 0-5 ans ou tranche non cochée : ignoré
      const t = trancheA(e.dateNaissance, ref);
      if (t === null || !tranches.includes(t)) return [];
      const q = quartiers.find((x) => x.id === e.quartierId);
      return [{ e, t, q, s: structures.find((x) => x.id === q?.structureId) }];
    });

  // Tri : par âge (du plus jeune au plus âgé) ou par quartier
  candidats.sort((a, b) => tri === 'age'
    ? b.e.dateNaissance.localeCompare(a.e.dateNaissance)
    : (a.q?.nom ?? '').localeCompare(b.q?.nom ?? '') || b.e.dateNaissance.localeCompare(a.e.dateNaissance));
  const groupes = new Map<string, Destinataire[]>();
  for (const d of candidats) {
    const cle = tri === 'age' ? libelleTranche(d.t) : d.q?.nom ?? '—';
    groupes.set(cle, [...(groupes.get(cle) ?? []), d]);
  }
  const destinataires = candidats.filter((d) => !exclus.has(d.e.id));

  /** Message final pour une famille */
  const composer = (d: Destinataire) => modele.replace(/\{(\w+)\}/g, (m, k: string) => ({
    parent: d.e.parentNom, enfant: d.e.prenom, age: texteAge(d.e.dateNaissance, ref),
    date: texteDate(date), heure: texteHeure(heure), structure: d.s?.nom ?? 'la structure du quartier', quartier: d.q?.nom ?? '',
  } as Record<string, string>)[k] ?? m);
  const apercu = destinataires[0] ? composer(destinataires[0]) : '';

  // Avance de l'envoi simulé : environ 2 secondes, quel que soit le nombre de familles
  useEffect(() => {
    if (etat !== 'envoi') return;
    if (envoyes >= destinataires.length) {
      setNbCampagne(destinataires.length);
      store.envoyerInvitations({
        mois: moisInvit, dateAtelier: date, heure, localiteId, quartierIds, tranches,
        message: modele, enfantIds: destinataires.map((d) => d.e.id),
      });
      setEtat('fini');
      return;
    }
    const pas = Math.max(1, Math.ceil(destinataires.length / 30));
    const delai = Math.min(400, Math.max(60, 1800 / Math.ceil(destinataires.length / pas)));
    const t = setTimeout(() => setEnvoyes((n) => Math.min(destinataires.length, n + pas)), delai);
    return () => clearTimeout(t);
  }, [etat, envoyes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Échap ferme (sauf pendant l'envoi)
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && etat !== 'envoi' && onFermer();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [etat, onFermer]);

  const basculerTranche = (t: TrancheId) => setTranches((l) => (l.includes(t) ? l.filter((x) => x !== t) : [...l, t].sort()));
  const basculerQuartier = (id: string) => setQuartierIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const basculerExclu = (id: string) => setExclus((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  /** Insère {champ} à l'endroit du curseur dans le message */
  function inserer(champ: string) {
    const z = zoneMessage.current;
    const debut = z?.selectionStart ?? modele.length;
    const fin = z?.selectionEnd ?? modele.length;
    setModele(modele.slice(0, debut) + `{${champ}}` + modele.slice(fin));
    requestAnimationFrame(() => { z?.focus(); z?.setSelectionRange(debut + champ.length + 2, debut + champ.length + 2); });
  }

  const enEnvoi = etat === 'envoi';
  const indexEnvoi = new Map(destinataires.map((d, i) => [d.e.id, i]));

  return (
    <div className="modal-fond" onClick={() => !enEnvoi && onFermer()}>
      <div className="fenetre fenetre-large inv" role="dialog" aria-modal="true" aria-label="Inviter des parents par SMS" onClick={(e) => e.stopPropagation()}>
        {!enEnvoi && <button className="fenetre-fermer" onClick={onFermer} aria-label="Fermer">×</button>}

        {etat === 'fini' ? (
          /* Confirmation */
          <div className="inv-fini">
            <svg className="popup-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
            <h2>{nbCampagne} SMS envoyé{nbCampagne > 1 ? 's' : ''}</h2>
            <p>Atelier du {texteDate(date)} à {texteHeure(heure)}. Les familles apparaissent avec la mention « SMS envoyé » dans les listes d'appels.</p>
            <p className="inv-simulation">Simulation : aucun SMS réel n'a été envoyé.</p>
            <button className="btn-sobre principal" onClick={onFermer} autoFocus>Fermer</button>
          </div>
        ) : (
          <>
            <header className="inv-tete">
              <h2>Inviter des parents</h2>
              <p>Par SMS, pour l'atelier d'éveil.</p>
            </header>

            <div className="inv-grille">
              {/* Colonne gauche : filtres et message */}
              <div className="inv-col">
                <section className="inv-bloc">
                  <h3><span>1</span> Qui inviter ?</h3>
                  <div className="inv-champ">
                    <span className="inv-libelle">Âge de l'enfant le jour de l'atelier</span>
                    <div className="inv-puces">
                      {TRANCHES.map((t) => (
                        <button key={t} type="button" aria-pressed={tranches.includes(t)} className={tranches.includes(t) ? 'actif' : ''} onClick={() => basculerTranche(t)} disabled={enEnvoi}>
                          {libelleTranche(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="inv-champ">
                    <span className="inv-libelle">Localité</span>
                    {!structureFixe && (
                      <select value={localiteId} disabled={enEnvoi} onChange={(e) => {
                        const v = e.target.value;
                        setLocaliteId(v);
                        setQuartierIds(quartiers.filter((q) => q.localiteId === v && !!q.structureId).map((q) => q.id));
                      }}>
                        {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                      </select>
                    )}
                    <div className="inv-puces">
                      {quartiersVille.length === 0 && <span className="inv-vide">Aucun quartier couvert dans cette ville.</span>}
                      {quartiersVille.map((q) => (
                        <button key={q.id} type="button" aria-pressed={quartierIds.includes(q.id)} className={quartierIds.includes(q.id) ? 'actif' : ''} onClick={() => basculerQuartier(q.id)} disabled={enEnvoi}>
                          {q.nom}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="inv-ligne">
                    <label className="inv-champ"><span className="inv-libelle">Date de l'atelier</span>
                      <input type="date" value={date} min={isoLocal(new Date())} onChange={(e) => e.target.value && setDate(e.target.value)} disabled={enEnvoi} />
                    </label>
                    <label className="inv-champ"><span className="inv-libelle">Heure</span>
                      <input type="time" value={heure} onChange={(e) => e.target.value && setHeure(e.target.value)} disabled={enEnvoi} />
                    </label>
                  </div>
                  <label className="inv-case">
                    <input type="checkbox" checked={sansDoublon} onChange={(e) => setSansDoublon(e.target.checked)} disabled={enEnvoi} />
                    Ne pas réinviter les familles déjà invitées ce mois-ci
                  </label>
                </section>

                <section className="inv-bloc">
                  <h3><span>3</span> Message</h3>
                  <textarea ref={zoneMessage} rows={5} value={modele} onChange={(e) => setModele(e.target.value)} disabled={enEnvoi} aria-label="Message" />
                  <div className="inv-champs">
                    {CHAMPS.map((c) => <button key={c} type="button" onClick={() => inserer(c)} disabled={enEnvoi}>{`{${c}}`}</button>)}
                  </div>
                  {apercu && (
                    <div className="inv-apercu">
                      <span className="inv-libelle">Aperçu · {destinataires[0].e.parentTelephone}</span>
                      <p className="inv-bulle">{apercu}</p>
                      <span className="inv-compte">{apercu.length} caractères · {Math.max(1, Math.ceil(apercu.length / 160))} SMS par famille</span>
                    </div>
                  )}
                </section>
              </div>

              {/* Colonne droite : destinataires */}
              <section className="inv-bloc inv-dest">
                <div className="inv-dest-tete">
                  <h3><span>2</span> Destinataires <em>{destinataires.length}</em></h3>
                  <div className="inv-tri" role="radiogroup" aria-label="Trier">
                    <button type="button" role="radio" aria-checked={tri === 'age'} className={tri === 'age' ? 'actif' : ''} onClick={() => setTri('age')}>Par âge</button>
                    <button type="button" role="radio" aria-checked={tri === 'lieu'} className={tri === 'lieu' ? 'actif' : ''} onClick={() => setTri('lieu')}>Par localité</button>
                  </div>
                </div>
                {candidats.length === 0 ? (
                  <p className="inv-vide">Aucune famille ne correspond à ces critères.</p>
                ) : (
                  <div className="inv-liste">
                    {[...groupes.entries()].map(([titre, liste]) => (
                      <div key={titre} className="inv-groupe">
                        <h4>{titre} <span>{liste.length}</span></h4>
                        <ul>
                          {liste.map((d) => {
                            const i = indexEnvoi.get(d.e.id);
                            const envoye = i !== undefined && (etat !== 'edition') && i < envoyes;
                            return (
                              <li key={d.e.id} className={exclus.has(d.e.id) ? 'exclu' : ''}>
                                <label>
                                  <input type="checkbox" checked={!exclus.has(d.e.id)} onChange={() => basculerExclu(d.e.id)} disabled={enEnvoi} />
                                  <span className="inv-famille">
                                    <strong>{d.e.parentNom}</strong>
                                    <small>{d.e.prenom} · {texteAge(d.e.dateNaissance, ref)} · {tri === 'age' ? d.q?.nom : libelleTranche(d.t)}</small>
                                  </span>
                                  <span className="inv-tel">{envoye ? <span className="inv-ok">Envoyé ✓</span> : d.e.parentTelephone}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <footer className="inv-pied">
              {enEnvoi ? (
                <div className="inv-progression" role="status">
                  <span>Envoi en cours… {envoyes} / {destinataires.length}</span>
                  <div className="entonnoir-piste"><div className="entonnoir-barre" style={{ width: `${destinataires.length ? (envoyes / destinataires.length) * 100 : 0}%` }} /></div>
                </div>
              ) : (
                <span className="inv-simulation">Simulation : aucun SMS réel n'est envoyé.</span>
              )}
              <button className="btn-sobre principal" disabled={enEnvoi || destinataires.length === 0 || !modele.trim()} onClick={() => { setEnvoyes(0); setEtat('envoi'); }}>
                Envoyer {destinataires.length} SMS
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
