import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Jeu, TrancheId } from '../types';
import { libelleTranche } from '../utils/age';
import { lienYoutube } from '../utils/image';
import { competence, enLignes } from '../data/competences';

/** Une couleur par tranche d'âge, du plus clair (0-1 an) au plus foncé (4-5 ans) */
export const COULEURS_AGES = ['#F2B254', '#EC9A2E', '#E07B00', '#C76A00', '#A85700'];

export const compteJeux = (n: number) => (n ? `${n} jeu${n > 1 ? 'x' : ''}` : 'Aucun jeu pour le moment');

/** Image d'aperçu : miniature YouTube, sinon première photo des étapes */
export function vignetteJeu(j: Jeu): string | null {
  if (j.format === 'video' && j.videoUrl) {
    const id = lienYoutube(j.videoUrl)?.split('/embed/')[1];
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
  return j.etapes.find((e) => e.image)?.image ?? null;
}

/** Fenêtre plein écran (fiche ou formulaire) ; Échap ferme */
export function Fenetre({ titre, onFermer, children, large = false }: { titre: string; onFermer: () => void; children: ReactNode; large?: boolean }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onFermer]);
  return (
    <div className="modal-fond" onClick={onFermer}>
      <div className={`fenetre ${large ? 'fenetre-fiche' : ''}`} role="dialog" aria-modal="true" aria-label={titre} onClick={(e) => e.stopPropagation()}>
        <button className="fenetre-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        {children}
      </div>
    </div>
  );
}

/** Carte d'un jeu : vignette, format, nom, aperçu. « verrouille » : contenu réservé aux inscrits */
export function CarteJeu({ jeu, tranche, onOuvrir, verrouille = false }: { jeu: Jeu; tranche: TrancheId; onOuvrir: () => void; verrouille?: boolean }) {
  const vignette = vignetteJeu(jeu);
  return (
    <button className="jeu-carte" onClick={onOuvrir}>
      <span className="jeu-vignette" style={{ background: COULEURS_AGES[tranche] }}>
        {vignette
          ? <img src={vignette} alt="" loading="lazy" />
          : <span className="jeu-vignette-initiale" aria-hidden="true">{jeu.nom.charAt(0).toUpperCase()}</span>}
        {jeu.format === 'video' && !verrouille && <span className="jeu-lecture" aria-hidden="true">▶</span>}
        {verrouille && <span className="jeu-cadenas" aria-hidden="true"><Cadenas /></span>}
      </span>
      <span className="jeu-corps">
        <span className="jeu-badge">{jeu.format === 'video' ? 'Vidéo' : `${jeu.etapes.length} étape${jeu.etapes.length > 1 ? 's' : ''} en images`}</span>
        <span className="jeu-titre">{jeu.nom}</span>
        {jeu.utilisation && <span className="jeu-apercu">{jeu.utilisation}</span>}
        <span className="jeu-voir">{verrouille ? 'Débloquer le jeu ›' : 'Voir le jeu ›'}</span>
      </span>
    </button>
  );
}

const Coche = () => (
  <svg className="fiche-coche" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Loupe = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="m15 15 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
const Boite = () => (
  <svg className="fiche-boite" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z M3.5 7.5 12 11.5l8.5-4 M12 11.5v9" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

export const Cadenas =({ taille = 20 }: { taille?: number }) => (
  <svg viewBox="0 0 24 24" width={taille} height={taille} aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Fiche d'un jeu : vidéo ou étapes, utilisation, observation. Sans onSupprimer : lecture seule */
export function FicheJeu({ jeu, tranche, onSupprimer }: { jeu: Jeu; tranche: TrancheId; onSupprimer?: () => void }) {
  const yt = jeu.videoUrl ? lienYoutube(jeu.videoUrl) : null;
  const competences = (jeu.competences ?? []).map(competence).filter((c) => !!c);
  const materiel = jeu.materiel ?? [];
  const etapesJeu = enLignes(jeu.utilisation);
  const aObserver = enLignes(jeu.observer);
  return (
    <article className="fiche-jeu">
      <div className="fiche-pastilles">
        <span className="fiche-pastille" style={{ background: COULEURS_AGES[tranche] }}>{libelleTranche(tranche)}</span>
        <span className="fiche-pastille claire">{jeu.format === 'video' ? 'Vidéo' : `${jeu.etapes.length} étape${jeu.etapes.length > 1 ? 's' : ''} en images`}</span>
        {competences.length > 0 && <span className="fiche-pastille claire">{competences.length} capacité{competences.length > 1 ? 's' : ''}</span>}
      </div>
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

      {competences.length > 0 && (
        <section className="fiche-bloc">
          <h3>Ce que l'enfant développe</h3>
          <ul className="fiche-competences">
            {competences.map((c) => (
              <li key={c.id} style={{ background: c.fond }}>
                <span className="fiche-competence-icone" style={{ color: c.couleur }}>{c.icone}</span>
                <span>
                  <strong style={{ color: c.couleur }}>{c.nom}</strong>
                  <small>{c.description}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(materiel.length > 0 || etapesJeu.length > 0) && (
        <div className={`fiche-colonnes ${materiel.length && etapesJeu.length ? '' : 'seule'}`}>
          {materiel.length > 0 && (
            <section className="fiche-bloc fiche-materiel">
              <h3>Matériel</h3>
              <ul>
                {materiel.map((m) => <li key={m}><Boite />{m}</li>)}
              </ul>
            </section>
          )}
          {etapesJeu.length > 0 && (
            <section className="fiche-bloc">
              <h3>Comment jouer</h3>
              <ol className="fiche-etapes-jeu">
                {etapesJeu.map((e, i) => (
                  <li key={i}><span className="fiche-num" style={{ background: COULEURS_AGES[tranche] }}>{i + 1}</span><p>{e}</p></li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}

      {aObserver.length > 0 && (
        <section className="fiche-bloc fiche-observer">
          <h3><span className="fiche-observer-icone"><Loupe /></span>À observer chez l'enfant</h3>
          <ul>
            {aObserver.map((o) => <li key={o}><Coche />{o}</li>)}
          </ul>
        </section>
      )}

      {onSupprimer && <button className="btn-lien" onClick={onSupprimer}>Supprimer ce jeu</button>}
    </article>
  );
}
