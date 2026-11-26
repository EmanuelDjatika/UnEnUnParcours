import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Store } from '../store/useStore';
import type { TrancheId } from '../types';
import { TRANCHES, libelleTranche } from '../utils/age';
import IllustrationAge from './IllustrationAge';
import { COULEURS_AGES, Cadenas, CarteJeu, Fenetre, FicheJeu } from './JeuCommun';

/** Ce que l'enfant développe à chaque âge */
const ACCROCHES: Record<TrancheId, string> = {
  0: "Regarder, écouter, attraper : l'éveil des sens.",
  1: 'Marcher, empiler, faire entrer : découvrir les objets.',
  2: 'Parler, trier, imiter : les premiers mots et les couleurs.',
  3: 'Compter, assembler, raconter : vers le préscolaire.',
  4: "Observer, compter, jouer ensemble : prêt pour l'école.",
};

/** Le thème de chaque âge, en quelques mots */
const THEMES: Record<TrancheId, string> = {
  0: 'Les sens',
  1: 'Les objets',
  2: 'Les premiers mots',
  3: 'Compter, assembler',
  4: "Vers l'école",
};

/** Sur cet appareil, le formulaire a déjà été rempli : les jeux restent ouverts */
const CLE_ACCES = 'un-enfant-un-parcours-eveil:acces-jeux';
function lireAcces(): boolean {
  try { return localStorage.getItem(CLE_ACCES) === '1'; } catch { return false; }
}
function memoriserAcces() {
  try { localStorage.setItem(CLE_ACCES, '1'); } catch { /* navigation privée : l'accès vaut pour cette visite */ }
}

/** Formulaire court demandé avant d'ouvrir les jeux */
function FormulaireAcces({ store, trancheInitiale, onValide, onAnnuler }: {
  store: Store; trancheInitiale: TrancheId; onValide: (t: TrancheId) => void; onAnnuler: () => void;
}) {
  const { localites } = store.donnees;
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [localiteId, setLocaliteId] = useState('');
  const [tranche, setTranche] = useState<TrancheId>(trancheInitiale);
  const [accord, setAccord] = useState(false);
  const [erreur, setErreur] = useState('');

  function valider(e: FormEvent) {
    e.preventDefault();
    const chiffres = telephone.replace(/\D/g, '');
    if (chiffres.length < 8) return setErreur('Entrez un numéro de téléphone valide (8 chiffres au moins).');
    if (!localiteId) return setErreur('Choisissez votre ville.');
    if (!accord) return setErreur('Merci de cocher la case pour continuer.');
    store.enregistrerDemandeJeux({ prenom: prenom.trim(), telephone: telephone.trim(), localiteId, tranche });
    memoriserAcces();
    onValide(tranche);
  }

  return (
    <form className="jeu-form acces-form" onSubmit={valider}>
      <span className="acces-icone"><Cadenas taille={22} /></span>
      <h2>Accéder aux jeux</h2>
      <p className="acces-intro">C'est gratuit. Quelques informations nous aident à vous proposer les jeux et les ateliers adaptés à votre enfant.</p>

      <label className="champ"><span>Votre prénom</span>
        <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" />
      </label>
      <label className="champ"><span>Téléphone</span>
        <input required type="tel" inputMode="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Ex. 90 12 34 56" autoComplete="tel" />
      </label>
      <label className="champ"><span>Ville</span>
        <select required value={localiteId} onChange={(e) => setLocaliteId(e.target.value)}>
          <option value="">Choisir…</option>
          {[...localites].sort((a, b) => a.nom.localeCompare(b.nom)).map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
      </label>
      <div className="champ"><span>Âge de votre enfant</span>
        <div className="acces-ages" role="radiogroup" aria-label="Âge de votre enfant">
          {TRANCHES.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={tranche === t} className={tranche === t ? 'actif' : ''} onClick={() => setTranche(t)}>
              {libelleTranche(t)}
            </button>
          ))}
        </div>
      </div>
      <label className="acces-accord">
        <input type="checkbox" checked={accord} onChange={(e) => setAccord(e.target.checked)} />
        <span>J'accepte d'être contacté(e) par la structure de mon quartier pour les ateliers d'éveil.</span>
      </label>

      {erreur && <p className="message erreur" role="alert">{erreur}</p>}
      <div className="actions">
        <button type="button" className="btn-sobre" onClick={onAnnuler}>Annuler</button>
        <button type="submit" className="btn-sobre principal">Voir les jeux</button>
      </div>
    </form>
  );
}

/** Section « Les jeux » de la page publique : onglets par âge, jeux débloqués par un formulaire */
export default function JeuxPublics({ store }: { store: Store }) {
  const { ateliers } = store.donnees;
  const [tranche, setTranche] = useState<TrancheId>(() => TRANCHES.find((t) => ateliers[t].length > 0) ?? 0);
  const [acces, setAcces] = useState(lireAcces);
  const [formulaire, setFormulaire] = useState(false);
  // Jeu demandé avant le formulaire : il s'ouvre dès que le formulaire est validé
  const [vise, setVise] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);

  const jeux = ateliers[tranche];
  const jeuOuvert = ouvert ? jeux.find((j) => j.id === ouvert) : undefined;

  function ouvrir(id: string) {
    if (acces) return setOuvert(id);
    setVise(id);
    setFormulaire(true);
  }

  return (
    <section className="vt-section vt-jeux-publics" id="jeux">
      <div className="vt-jeux-entete">
        <div>
          <span className="vt-surtitre">À la maison</span>
          <h2>Des jeux pour chaque âge</h2>
          <p>Des vidéos et des fiches pour fabriquer, avec des cartons, des jeux adaptés à l'âge de votre enfant.</p>
        </div>
        {!acces && (
          <button className="btn btn-principal vt-cta vt-jeux-debloquer" onClick={() => { setVise(null); setFormulaire(true); }}>
            <Cadenas taille={18} /> Débloquer les jeux
          </button>
        )}
      </div>

      {/* Onglets par tranche d'âge */}
      {/* Le parcours de l'enfant : une étape par âge, reliées par un trait */}
      <div className="vt-ages" role="tablist" aria-label="Âge de l'enfant">
        {TRANCHES.map((t) => {
          const n = ateliers[t].length;
          return (
            <button key={t} role="tab" id={`onglet-age-${t}`} aria-selected={tranche === t} aria-controls="jeux-age"
              className={`vt-age-onglet ${tranche === t ? 'actif' : ''} ${n ? '' : 'vide'}`} onClick={() => setTranche(t)}>
              <span className="vt-age-image"><IllustrationAge tranche={t} taille={88} /></span>
              <strong>{libelleTranche(t)}</strong>
              <small>{THEMES[t]}</small>
              <span className="vt-age-compte">{n ? `${n} jeu${n > 1 ? 'x' : ''}` : 'Bientôt'}</span>
            </button>
          );
        })}
      </div>

      <div className="vt-jeux-panneau" id="jeux-age" role="tabpanel" aria-labelledby={`onglet-age-${tranche}`}>
        <p className="vt-jeux-accroche"><span style={{ background: COULEURS_AGES[tranche] }} />{ACCROCHES[tranche]}</p>
        {jeux.length > 0 ? (
          <ul className="jeux-cartes">
            {jeux.map((j) => (
              <li key={j.id}><CarteJeu jeu={j} tranche={tranche} verrouille={!acces} onOuvrir={() => ouvrir(j.id)} /></li>
            ))}
          </ul>
        ) : (
          <p className="vt-jeux-vide">Les jeux pour les {libelleTranche(tranche)} arrivent bientôt.</p>
        )}
      </div>

      {formulaire && (
        <Fenetre titre="Accéder aux jeux" onFermer={() => setFormulaire(false)}>
          <FormulaireAcces store={store} trancheInitiale={tranche} onAnnuler={() => setFormulaire(false)}
            onValide={(t) => {
              setAcces(true);
              setFormulaire(false);
              // Ouvre le jeu demandé ; sinon, affiche les jeux de l'âge de l'enfant
              if (vise && jeux.some((j) => j.id === vise)) setOuvert(vise);
              else setTranche(t);
              setVise(null);
            }} />
        </Fenetre>
      )}

      {jeuOuvert && (
        <Fenetre large titre={jeuOuvert.nom} onFermer={() => setOuvert(null)}>
          <FicheJeu jeu={jeuOuvert} tranche={tranche} />
        </Fenetre>
      )}
    </section>
  );
}
