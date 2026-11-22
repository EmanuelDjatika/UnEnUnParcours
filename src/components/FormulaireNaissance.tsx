import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Langue, Sexe, Structure } from '../types';
import { LANGUES } from '../types';
import type { Store } from '../store/useStore';
import { aujourdhui } from '../utils/age';
import EtiquetteStructure, { nomAvecType } from './EtiquetteStructure';

const NOUVEAU = '__nouveau__';

/** Formulaire d'enregistrement d'une naissance à la mairie */
/** villeFixe : compte mairie, la ville est imposée */
export default function FormulaireNaissance({ store, villeFixe, onTermine }: { store: Store; villeFixe?: string; onTermine?: () => void }) {
  // Fenêtre après enregistrement : chargement → succès (avec la structure destinataire)
  const [popup, setPopup] = useState<{ etat: 'chargement' | 'succes'; prenom: string; structure?: Structure } | null>(null);
  useEffect(() => {
    if (popup?.etat !== 'chargement') return;
    const t = setTimeout(() => setPopup((p) => (p ? { ...p, etat: 'succes' } : p)), 1400);
    return () => clearTimeout(t);
  }, [popup?.etat]);

  const { regions, localites, quartiers, structures } = store.donnees;
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [sexe, setSexe] = useState<Sexe | ''>('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [parentNom, setParentNom] = useState('');
  const [parentTelephone, setParentTelephone] = useState('+228 ');
  const [langue, setLangue] = useState<Langue>('Éwé');
  const villeDepart = localites.find((l) => l.id === villeFixe) ?? localites[0];
  const [regionId, setRegionId] = useState(villeDepart?.regionId ?? '');
  const [localiteId, setLocaliteId] = useState(villeDepart?.id ?? '');
  const villesRegion = localites.filter((l) => l.regionId === regionId);
  const [quartierId, setQuartierId] = useState('');
  const [nouveauQuartier, setNouveauQuartier] = useState('');
  const [structureNouveau, setStructureNouveau] = useState('');
  const [consentement, setConsentement] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);

  const quartiersLocalite = quartiers.filter((q) => q.localiteId === localiteId);
  const structuresLocalite = structures.filter((c) => c.localiteId === localiteId);
  const quartierChoisi = quartiers.find((q) => q.id === quartierId);
  // Structure qui couvre le quartier : c'est elle qui recevra la fiche
  const structureDuQuartier = quartierChoisi ? structures.find((c) => c.id === quartierChoisi.structureId) : undefined;

  function enregistrer(e: FormEvent) {
    e.preventDefault();
    if (!consentement) {
      setMessage({ ok: false, texte: "L'accord du parent est obligatoire pour enregistrer." });
      return;
    }
    if (!sexe || !dateNaissance || !localiteId || !quartierId) {
      setMessage({ ok: false, texte: 'Merci de remplir tous les champs.' });
      return;
    }
    if (dateNaissance > aujourdhui()) {
      setMessage({ ok: false, texte: 'La date de naissance ne peut pas être dans le futur.' });
      return;
    }
    let qId = quartierId;
    if (quartierId === NOUVEAU) {
      if (!nouveauQuartier.trim()) {
        setMessage({ ok: false, texte: 'Indiquez le nom du nouveau quartier.' });
        return;
      }
      qId = store.ajouterQuartier(nouveauQuartier.trim(), localiteId, structureNouveau).id;
    }
    store.ajouterEnfant({
      prenom: prenom.trim(),
      nom: nom.trim(),
      sexe,
      dateNaissance,
      parentNom: parentNom.trim(),
      parentTelephone: parentTelephone.trim(),
      langue,
      localiteId,
      quartierId: qId,
      consentement: true,
    });
    // Transmission automatique : la structure qui couvre le quartier reçoit la fiche
    const destinataire = quartierId === NOUVEAU ? structures.find((c) => c.id === structureNouveau) : structureDuQuartier;
    setMessage(null);
    setPopup({ etat: 'chargement', prenom: prenom.trim(), structure: destinataire });
    // On garde localité et quartier pour enchaîner les saisies
    setPrenom(''); setNom(''); setSexe(''); setDateNaissance('');
    setParentNom(''); setParentTelephone('+228 '); setConsentement(false);
    setQuartierId(qId); setNouveauQuartier(''); setStructureNouveau('');
  }

  return (
    <form className="carte formulaire" onSubmit={enregistrer}>
      <h2>Nouvel enfant</h2>

      <fieldset>
        <legend>L'enfant</legend>
        <div className="grille">
          <label className="champ"><span>Prénom</span>
            <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </label>
          <label className="champ"><span>Nom</span>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </label>
          <div className="champ"><span>Sexe</span>
            <div className="choix">
              <label className={`pastille ${sexe === 'F' ? 'actif' : ''}`}><input type="radio" name="sexe" checked={sexe === 'F'} onChange={() => setSexe('F')} required /> Fille</label>
              <label className={`pastille ${sexe === 'M' ? 'actif' : ''}`}><input type="radio" name="sexe" checked={sexe === 'M'} onChange={() => setSexe('M')} /> Garçon</label>
            </div>
          </div>
          <label className="champ"><span>Date de naissance</span>
            <input type="date" required max={aujourdhui()} value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Le parent</legend>
        <div className="grille">
          <label className="champ"><span>Nom du parent</span>
            <input required value={parentNom} onChange={(e) => setParentNom(e.target.value)} />
          </label>
          <label className="champ"><span>Téléphone</span>
            <input type="tel" required inputMode="tel" pattern="[+0-9 ]{8,}" value={parentTelephone} onChange={(e) => setParentTelephone(e.target.value)} />
          </label>
          <label className="champ"><span>Langue préférée</span>
            <select value={langue} onChange={(e) => setLangue(e.target.value as Langue)}>
              {LANGUES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Le lieu</legend>
        <div className="grille">
          {/* Compte mairie : région et ville préremplies, mais modifiables */}
          <label className="champ"><span>Région</span>
            <select value={regionId} onChange={(e) => { const r = e.target.value; setRegionId(r); setLocaliteId(localites.find((l) => l.regionId === r)?.id ?? ''); setQuartierId(''); }}>
              {regions.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </label>
          <label className="champ"><span>Ville</span>
            <select required value={localiteId} onChange={(e) => { setLocaliteId(e.target.value); setQuartierId(''); }}>
              {villesRegion.length === 0 && <option value="">Aucune ville enregistrée</option>}
              {villesRegion.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
            </select>
          </label>
          <label className="champ"><span>Quartier</span>
            <select required value={quartierId} onChange={(e) => setQuartierId(e.target.value)}>
              <option value="">— Choisir —</option>
              {quartiersLocalite.map((q) => <option key={q.id} value={q.id}>{q.nom}</option>)}
              <option value={NOUVEAU}>+ Ajouter un quartier…</option>
            </select>
          </label>
          {quartierId === NOUVEAU && (
            <>
              <label className="champ"><span>Nom du nouveau quartier</span>
                <input value={nouveauQuartier} onChange={(e) => setNouveauQuartier(e.target.value)} />
              </label>
              <label className="champ"><span>Structure de rattachement</span>
                <select value={structureNouveau} onChange={(e) => setStructureNouveau(e.target.value)}>
                  <option value="">Aucune pour l'instant</option>
                  {structuresLocalite.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </label>
            </>
          )}
        </div>
        {structureDuQuartier && <p className="aide aide-structure">Structure du quartier : <strong>{structureDuQuartier.nom}</strong> <EtiquetteStructure type={structureDuQuartier.type} /></p>}
        {quartierChoisi && !structureDuQuartier && <p className="aide">Ce quartier n'est encore couvert par aucune structure.</p>}
      </fieldset>

      <label className={`consentement ${consentement ? 'ok' : ''}`}>
        <input type="checkbox" checked={consentement} onChange={(e) => setConsentement(e.target.checked)} />
        <span>Le parent accepte d'être contacté par la structure du quartier</span>
      </label>

      {message && <p className={`message ${message.ok ? 'succes' : 'erreur'}`} role="status">{message.texte}</p>}

      <button type="submit" className="btn btn-principal btn-large" disabled={!consentement}>
        Enregistrer la naissance
      </button>
      {popup && (
        <div className="modal-fond popup-fond" role="dialog" aria-modal="true" aria-live="polite">
          <div className="popup">
            {popup.etat === 'chargement' ? (
              <>
                <div className="popup-spinner" aria-hidden="true" />
                <h2>Enregistrement…</h2>
                <p>Transmission à la structure du quartier</p>
              </>
            ) : (
              <>
                <svg className="popup-check" viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" />
                  <path d="M15 27l7 7 15-16" />
                </svg>
                <h2>{popup.prenom} est enregistré(e)</h2>
                {popup.structure ? <>
                  <p>Envoyé à <strong>{nomAvecType(popup.structure)}</strong></p>
                  <EtiquetteStructure type={popup.structure.type} />
                </> : <p>Aucune structure ne couvre encore ce quartier : la fiche sera transmise dès qu'une structure le couvrira.</p>}
                <p className="popup-question">Enregistrer un autre enfant ?</p>
                <div className="popup-actions">
                  <button type="button" className="btn-sobre" onClick={() => { setPopup(null); onTermine?.(); }}>Non, tableau de bord</button>
                  <button type="button" className="btn-sobre principal" autoFocus onClick={() => { setPopup(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Oui, un autre</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
