import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Store } from '../store/useStore';
import type { CompetenceId, Etape, Jeu, TrancheId } from '../types';
import { COMPETENCES, enLignes } from '../data/competences';
import { TRANCHES, libelleTranche } from '../utils/age';
import { compresserImage } from '../utils/image';
import IllustrationAge from '../components/IllustrationAge';
import ConfirmationModal from '../components/ConfirmationModal';
import { COULEURS_AGES, CarteJeu, Fenetre, FicheJeu, compteJeux } from '../components/JeuCommun';

const nouvelId = () => `jeu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Formulaire d'ajout d'un jeu : vidéo OU fabrication en images, + utilisation et observation */
function FormulaireJeu({ tranche, onEnregistrer, onAnnuler }: { tranche: TrancheId; onEnregistrer: (j: Jeu) => void; onAnnuler: () => void }) {
  const [nom, setNom] = useState('');
  const [format, setFormat] = useState<Jeu['format']>('fabrication');
  const [videoUrl, setVideoUrl] = useState('');
  const [etapes, setEtapes] = useState<Etape[]>([{ texte: '' }]);
  const [utilisation, setUtilisation] = useState('');
  const [observer, setObserver] = useState('');
  const [competences, setCompetences] = useState<CompetenceId[]>([]);
  const [materiel, setMateriel] = useState('');
  const [erreur, setErreur] = useState('');

  const basculer = (id: CompetenceId) => setCompetences((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const majEtape = (i: number, e: Partial<Etape>) => setEtapes((l) => l.map((x, k) => (k === i ? { ...x, ...e } : x)));

  async function ajouterPhoto(i: number, f: File | undefined) {
    if (!f) return;
    try { majEtape(i, { image: await compresserImage(f) }); } catch { setErreur("Cette image n'a pas pu être lue."); }
  }

  function valider(e: FormEvent) {
    e.preventDefault();
    const etapesOk = etapes.filter((x) => x.texte.trim() || x.image);
    if (format === 'video' && !/^https?:\/\//.test(videoUrl.trim())) return setErreur('Collez le lien de la vidéo (https://…).');
    if (format === 'fabrication' && etapesOk.length === 0) return setErreur('Ajoutez au moins une étape de fabrication.');
    onEnregistrer({
      id: nouvelId(), nom: nom.trim(), format,
      videoUrl: format === 'video' ? videoUrl.trim() : undefined,
      etapes: format === 'fabrication' ? etapesOk.map((x) => ({ ...x, texte: x.texte.trim() })) : [],
      utilisation: utilisation.trim(), observer: observer.trim(),
      competences, materiel: enLignes(materiel),
    });
  }

  return (
    <form className="jeu-form" onSubmit={valider}>
      <h2>Nouveau jeu · {libelleTranche(tranche)}</h2>
      <label className="champ"><span>Nom du jeu</span>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Hochet-bouteille" />
      </label>

      <div className="champ"><span>Comment montrer la fabrication ?</span>
        <div className="format-choix" role="radiogroup">
          <button type="button" role="radio" aria-checked={format === 'fabrication'} className={format === 'fabrication' ? 'actif' : ''} onClick={() => setFormat('fabrication')}>Étapes en images</button>
          <button type="button" role="radio" aria-checked={format === 'video'} className={format === 'video' ? 'actif' : ''} onClick={() => setFormat('video')}>Vidéo</button>
        </div>
      </div>

      {format === 'video' ? (
        <label className="champ"><span>Lien de la vidéo</span>
          <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/…" />
        </label>
      ) : (
        <div className="champ"><span>Étapes de fabrication</span>
          <ol className="etapes-edition">
            {etapes.map((et, i) => (
              <li key={i}>
                <span className="etape-num">{i + 1}</span>
                <div className="etape-corps">
                  <textarea rows={2} value={et.texte} onChange={(e) => majEtape(i, { texte: e.target.value })} placeholder="Ce qu'on fait à cette étape" />
                  <div className="etape-photo">
                    {et.image && <img src={et.image} alt={`Étape ${i + 1}`} />}
                    <label className="btn-sobre">
                      {et.image ? 'Changer la photo' : 'Ajouter une photo'}
                      <input type="file" accept="image/*" hidden onChange={(e) => ajouterPhoto(i, e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
                {etapes.length > 1 && <button type="button" className="etape-suppr" onClick={() => setEtapes((l) => l.filter((_, k) => k !== i))} aria-label={`Retirer l'étape ${i + 1}`}>×</button>}
              </li>
            ))}
          </ol>
          <button type="button" className="btn-sobre" onClick={() => setEtapes((l) => [...l, { texte: '' }])}>+ Ajouter une étape</button>
        </div>
      )}

      <div className="champ"><span>Ce que l'enfant développe</span>
        <div className="competences-choix">
          {COMPETENCES.map((c) => {
            const actif = competences.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={actif} onClick={() => basculer(c.id)}
                style={actif ? { background: c.fond, borderColor: c.couleur, color: c.couleur } : undefined}>
                <span className="competence-mini" style={{ color: c.couleur }}>{c.icone}</span>{c.nom}
              </button>
            );
          })}
        </div>
      </div>
      <label className="champ"><span>Matériel <small className="aide">un élément par ligne</small></span>
        <textarea rows={3} value={materiel} onChange={(e) => setMateriel(e.target.value)} placeholder={'Une boîte en carton\nDes bouchons\nDe la colle'} />
      </label>
      <label className="champ"><span>Comment jouer avec l'enfant <small className="aide">une étape par ligne</small></span>
        <textarea rows={4} value={utilisation} onChange={(e) => setUtilisation(e.target.value)} placeholder={"Montrez le geste à l'enfant\nLaissez-le essayer seul"} />
      </label>
      <label className="champ"><span>Ce qu'il faut observer chez l'enfant <small className="aide">un point par ligne</small></span>
        <textarea rows={4} value={observer} onChange={(e) => setObserver(e.target.value)} placeholder={"Suit l'objet des yeux\nAttrape avec les deux mains"} />
      </label>

      {erreur && <p className="message erreur" role="alert">{erreur}</p>}
      <div className="actions">
        <button type="button" className="btn-sobre" onClick={onAnnuler}>Annuler</button>
        <button type="submit" className="btn-sobre principal">Enregistrer le jeu</button>
      </div>
    </form>
  );
}

/** Espace crèche : les jeux à fabriquer pendant les ateliers, par âge */
export default function Jeux({ store }: { store: Store }) {
  const { ateliers } = store.donnees;
  const [tranche, setTranche] = useState<TrancheId | null>(null);
  const [ajout, setAjout] = useState<TrancheId | null>(null);
  const [ouvert, setOuvert] = useState<{ t: TrancheId; id: string } | null>(null);
  const [aSupprimer, setASupprimer] = useState<{ t: TrancheId; id: string } | null>(null);
  const [erreurStockage, setErreurStockage] = useState(false);

  const jeuOuvert = ouvert && ateliers[ouvert.t].find((j) => j.id === ouvert.id);

  function enregistrer(t: TrancheId, j: Jeu) {
    // Vérifie que le stockage local a la place (les photos prennent de l'espace)
    try {
      // On écrit directement la nouvelle version : si ça échoue, rien n'est perdu
      localStorage.setItem('un-enfant-un-parcours-eveil:v2', JSON.stringify({ ...store.donnees, ateliers: { ...ateliers, [t]: [...ateliers[t], j] } }));
    } catch {
      setErreurStockage(true);
      return;
    }
    store.majAteliers(t, [...ateliers[t], j]);
    setAjout(null);
  }

  return (
    <div className="page tdb creches">
      <div className="jeux-grille">
        {TRANCHES.map((t) => (
          <button key={t} className="jeux-carte" onClick={() => setTranche(t)}>
            <span className="jeux-tete">
              <IllustrationAge tranche={t} couleur={COULEURS_AGES[t]} taille={64} />
              <span className="jeux-tete-texte">
                <span className="jeux-titre">{libelleTranche(t)}</span>
                <span className="tdb-detail">{compteJeux(ateliers[t].length)}</span>
              </span>
              <span className="jeux-chevron" aria-hidden="true">›</span>
            </span>
          </button>
        ))}
      </div>

      {/* Une seule fenêtre à la fois : fiche ou formulaire par-dessus la liste de la tranche */}
      {tranche !== null && ajout === null && !ouvert && (
        <Fenetre titre={`Jeux ${libelleTranche(tranche)}`} onFermer={() => setTranche(null)}>
          <div className="jeux-fenetre">
            <div className="jeux-tete">
              <IllustrationAge tranche={tranche} couleur={COULEURS_AGES[tranche]} taille={64} />
              <span className="jeux-tete-texte">
                <h2>Jeux {libelleTranche(tranche)}</h2>
                <span className="tdb-detail">{compteJeux(ateliers[tranche].length)}</span>
              </span>
            </div>
            {ateliers[tranche].length > 0 && (
              <ul className="jeux-cartes">
                {ateliers[tranche].map((j) => (
                  <li key={j.id}><CarteJeu jeu={j} tranche={tranche} onOuvrir={() => setOuvert({ t: tranche, id: j.id })} /></li>
                ))}
              </ul>
            )}
            <button className="jeux-ajouter" onClick={() => setAjout(tranche)}>+ Ajouter un jeu</button>
          </div>
        </Fenetre>
      )}

      {ajout !== null && (
        <Fenetre titre="Nouveau jeu" onFermer={() => setAjout(null)}>
          <FormulaireJeu tranche={ajout} onAnnuler={() => setAjout(null)} onEnregistrer={(j) => enregistrer(ajout, j)} />
          {erreurStockage && <p className="message erreur">Plus de place sur l'appareil : utilisez moins de photos, ou une vidéo.</p>}
        </Fenetre>
      )}

      {ouvert && jeuOuvert && (
        <Fenetre large titre={jeuOuvert.nom} onFermer={() => setOuvert(null)}>
          <FicheJeu jeu={jeuOuvert} tranche={ouvert.t} onSupprimer={() => setASupprimer(ouvert)} />
        </Fenetre>
      )}

      <ConfirmationModal
        ouvert={!!aSupprimer}
        titre="Supprimer ce jeu ?"
        message="La fiche et ses photos seront retirées."
        libelleConfirmer="Supprimer"
        danger
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => {
          if (aSupprimer) store.majAteliers(aSupprimer.t, ateliers[aSupprimer.t].filter((j) => j.id !== aSupprimer.id));
          setASupprimer(null);
          setOuvert(null);
        }}
      />
    </div>
  );
}
