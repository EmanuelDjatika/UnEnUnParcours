import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { Store } from '../store/useStore';
import type { Etape, Jeu, TrancheId } from '../types';
import { TRANCHES, libelleTranche } from '../utils/age';
import { compresserImage, lienYoutube } from '../utils/image';
import IllustrationAge from '../components/IllustrationAge';
import ConfirmationModal from '../components/ConfirmationModal';

const COULEURS_AGES = ['#F2B254', '#EC9A2E', '#E07B00', '#C76A00', '#A85700'];

const nouvelId = () => `jeu-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Fenêtre plein écran (fiche ou formulaire) ; Échap ferme */
function Fenetre({ titre, onFermer, children }: { titre: string; onFermer: () => void; children: ReactNode }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onFermer]);
  return (
    <div className="modal-fond" onClick={onFermer}>
      <div className="fenetre" role="dialog" aria-modal="true" aria-label={titre} onClick={(e) => e.stopPropagation()}>
        <button className="fenetre-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        {children}
      </div>
    </div>
  );
}

/** Formulaire d'ajout d'un jeu : vidéo OU fabrication en images, + utilisation et observation */
function FormulaireJeu({ tranche, onEnregistrer, onAnnuler }: { tranche: TrancheId; onEnregistrer: (j: Jeu) => void; onAnnuler: () => void }) {
  const [nom, setNom] = useState('');
  const [format, setFormat] = useState<Jeu['format']>('fabrication');
  const [videoUrl, setVideoUrl] = useState('');
  const [etapes, setEtapes] = useState<Etape[]>([{ texte: '' }]);
  const [utilisation, setUtilisation] = useState('');
  const [observer, setObserver] = useState('');
  const [erreur, setErreur] = useState('');

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

      <label className="champ"><span>Comment l'utiliser avec l'enfant</span>
        <textarea rows={3} value={utilisation} onChange={(e) => setUtilisation(e.target.value)} />
      </label>
      <label className="champ"><span>Ce qu'il faut observer chez l'enfant</span>
        <textarea rows={3} value={observer} onChange={(e) => setObserver(e.target.value)} placeholder="Ex. suit l'objet des yeux, attrape avec les deux mains…" />
      </label>

      {erreur && <p className="message erreur" role="alert">{erreur}</p>}
      <div className="actions">
        <button type="button" className="btn-sobre" onClick={onAnnuler}>Annuler</button>
        <button type="submit" className="btn-sobre principal">Enregistrer le jeu</button>
      </div>
    </form>
  );
}

/** Fiche d'un jeu : vidéo ou étapes, utilisation, observation */
function FicheJeu({ jeu, tranche, onSupprimer }: { jeu: Jeu; tranche: TrancheId; onSupprimer: () => void }) {
  const yt = jeu.videoUrl ? lienYoutube(jeu.videoUrl) : null;
  return (
    <article className="fiche-jeu">
      <span className="fiche-age">{libelleTranche(tranche)}</span>
      <h2>{jeu.nom}</h2>

      <h3>Fabrication</h3>
      {jeu.format === 'video' ? (
        yt ? <div className="video"><iframe src={yt} title={jeu.nom} allowFullScreen /></div>
          : <a className="btn-sobre principal" href={jeu.videoUrl} target="_blank" rel="noreferrer">Regarder la vidéo ›</a>
      ) : (
        <ol className="etapes-fiche">
          {jeu.etapes.map((et, i) => (
            <li key={i}>
              {et.image && <img src={et.image} alt={`Étape ${i + 1}`} />}
              <p><strong>{i + 1}.</strong> {et.texte}</p>
            </li>
          ))}
        </ol>
      )}

      {jeu.utilisation && <><h3>Utilisation</h3><p>{jeu.utilisation}</p></>}
      {jeu.observer && <><h3>À observer chez l'enfant</h3><p className="a-observer">{jeu.observer}</p></>}

      <button className="btn-lien" onClick={onSupprimer}>Supprimer ce jeu</button>
    </article>
  );
}

/** Espace crèche : les jeux à fabriquer pendant les ateliers, par âge */
export default function Jeux({ store }: { store: Store }) {
  const { ateliers } = store.donnees;
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
          <section key={t} className="jeux-carte">
            <div className="jeux-tete">
              <IllustrationAge tranche={t} couleur={COULEURS_AGES[t]} taille={52} />
              <div>
                <h3>{libelleTranche(t)}</h3>
                <span className="tdb-detail">{ateliers[t].length ? `${ateliers[t].length} jeu${ateliers[t].length > 1 ? 'x' : ''}` : 'Aucun jeu pour le moment'}</span>
              </div>
            </div>
            {ateliers[t].length > 0 && (
              <ul className="jeux-liste">
                {ateliers[t].map((j) => (
                  <li key={j.id}>
                    <button className="jeu-ligne" onClick={() => setOuvert({ t, id: j.id })}>
                      <span className="jeux-puce" style={{ background: COULEURS_AGES[t] }} />
                      <span className="jeu-nom">{j.nom}</span>
                      <span className="jeu-format">{j.format === 'video' ? 'Vidéo' : `${j.etapes.length} étape${j.etapes.length > 1 ? 's' : ''}`}</span>
                      <span aria-hidden="true">›</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="jeux-ajouter" onClick={() => setAjout(t)}>+ Ajouter un jeu</button>
          </section>
        ))}
      </div>

      {ajout !== null && (
        <Fenetre titre="Nouveau jeu" onFermer={() => setAjout(null)}>
          <FormulaireJeu tranche={ajout} onAnnuler={() => setAjout(null)} onEnregistrer={(j) => enregistrer(ajout, j)} />
          {erreurStockage && <p className="message erreur">Plus de place sur l'appareil : utilisez moins de photos, ou une vidéo.</p>}
        </Fenetre>
      )}

      {ouvert && jeuOuvert && (
        <Fenetre titre={jeuOuvert.nom} onFermer={() => setOuvert(null)}>
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
