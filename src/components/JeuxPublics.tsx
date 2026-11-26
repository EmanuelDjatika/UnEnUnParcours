import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { Store } from '../store/useStore';
import type { Jeu, TrancheId } from '../types';
import { TRANCHES, libelleTranche } from '../utils/age';
import IllustrationAge from './IllustrationAge';
import { COULEURS_AGES, Cadenas, Fenetre, FicheJeu, vignetteJeu } from './JeuCommun';
import { BESOINS } from '../data/besoins';
import { competence } from '../data/competences';

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

/** Un jeu, en petit : vignette de la vidéo, nom, et ce qu'il faut pour l'ouvrir */
function PastilleJeu({ jeu, tranche, verrouille, onOuvrir }: { jeu: Jeu; tranche: TrancheId; verrouille: boolean; onOuvrir: () => void }) {
  const vignette = vignetteJeu(jeu);
  return (
    <button className="besoin-jeu" onClick={onOuvrir}>
      <span className="besoin-jeu-vignette" style={{ background: COULEURS_AGES[tranche] }}>
        {vignette ? <img src={vignette} alt="" loading="lazy" /> : <b>{jeu.nom.charAt(0)}</b>}
        <i aria-hidden="true">{verrouille ? <Cadenas taille={13} /> : '▶'}</i>
      </span>
      <span className="besoin-jeu-texte">
        <small>{jeu.format === 'video' ? 'Vidéo de fabrication' : 'Fabrication en images'}</small>
        <strong>{jeu.nom}</strong>
      </span>
      <span className="besoin-jeu-fleche" aria-hidden="true">›</span>
    </button>
  );
}

/**
 * Schéma d'un âge : chaque besoin de l'enfant, relié au(x) jeu(x) qui y répondent.
 * Les jeux sans capacité correspondante sont listés à la fin.
 */
function SchemaBesoins({ tranche, jeux, verrouille, onOuvrir }: { tranche: TrancheId; jeux: Jeu[]; verrouille: boolean; onOuvrir: (id: string) => void }) {
  const besoins = BESOINS[tranche];
  const relies = new Set<string>();
  const lignes = besoins.map((b) => {
    const associes = jeux.filter((j) => j.competences?.includes(b.competence));
    associes.forEach((j) => relies.add(j.id));
    return { besoin: b, comp: competence(b.competence)!, associes };
  });
  const autres = jeux.filter((j) => !relies.has(j.id));
  const couverts = lignes.filter((l) => l.associes.length).length;

  return (
    <div className="schema">
      <div className="schema-tete">
        <IllustrationAge tranche={tranche} taille={84} />
        <div>
          <span className="schema-surtitre">À {libelleTranche(tranche)}</span>
          <h3>Ce dont votre enfant a besoin</h3>
          <p>{ACCROCHES[tranche]}</p>
        </div>
        <div className="schema-bilan" aria-label={`${couverts} besoins sur ${besoins.length} ont un jeu`}>
          <strong>{couverts}<span>/{besoins.length}</span></strong>
          <small>besoins avec un jeu</small>
        </div>
      </div>

      <div className="schema-colonnes" aria-hidden="true">
        <span>Le besoin</span><span>Le jeu à fabriquer</span>
      </div>
      <ol className="schema-lignes">
        {lignes.map(({ besoin, comp, associes }) => (
          <li key={besoin.competence} className={`schema-ligne ${associes.length ? '' : 'sans-jeu'}`} style={{ '--c': comp.couleur, '--f': comp.fond } as CSSProperties}>
            <div className="schema-besoin">
              <span className="schema-icone">{comp.icone}</span>
              <div>
                <strong>{comp.nom}</strong>
                <p>{besoin.texte}</p>
              </div>
            </div>
            <span className="schema-lien" aria-hidden="true" />
            <div className="schema-jeux">
              {associes.length
                ? associes.map((j) => <PastilleJeu key={j.id} jeu={j} tranche={tranche} verrouille={verrouille} onOuvrir={() => onOuvrir(j.id)} />)
                : <span className="schema-attente">Jeu bientôt disponible</span>}
            </div>
          </li>
        ))}
      </ol>

      {autres.length > 0 && (
        <div className="schema-autres">
          <h4>Autres jeux pour cet âge</h4>
          <div className="schema-jeux">
            {autres.map((j) => <PastilleJeu key={j.id} jeu={j} tranche={tranche} verrouille={verrouille} onOuvrir={() => onOuvrir(j.id)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <SchemaBesoins tranche={tranche} jeux={jeux} verrouille={!acces} onOuvrir={ouvrir} />
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
