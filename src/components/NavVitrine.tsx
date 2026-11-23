import { useEffect, useState } from 'react';
import LogoEnfant from './LogoEnfant';

/** Liens de la barre : ancres des sections de la page de présentation */
const LIENS = [
  { id: 'fait-maison', libelle: 'Le projet' },
  { id: 'pourquoi', libelle: 'Pourquoi' },
  { id: 'parcours', libelle: 'Le parcours' },
  { id: 'ateliers', libelle: 'Les ateliers' },
];

/** Fait défiler en douceur jusqu'à une section (le décalage sous la barre est géré en CSS) */
export const allerA = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const Fleche = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Barre de navigation de la page de présentation :
 * flottante et collée en haut, translucide, lien de la section en cours mis en évidence,
 * menu déroulant sur mobile.
 */
export default function NavVitrine({ onEntrer, connecte }: { onEntrer: () => void; connecte: boolean }) {
  const [defile, setDefile] = useState(false);
  const [actif, setActif] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const libelleCta = connecte ? 'Mon espace' : 'Se connecter';

  // Dès qu'on quitte le haut de la page, la barre prend un fond et une ombre
  useEffect(() => {
    const f = () => setDefile(window.scrollY > 12);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  // Section qui traverse le milieu de l'écran → lien actif
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entrees) => {
      for (const e of entrees) {
        if (e.isIntersecting) setActif(e.target.id);
        else setActif((a) => (a === e.target.id ? '' : a));
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    LIENS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // Échap ferme le menu mobile
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [ouvert]);

  const aller = (id: string) => { setOuvert(false); allerA(id); };

  return (
    <header className={`vt-nav ${defile ? 'defile' : ''} ${ouvert ? 'ouvert' : ''}`}>
      <div className="vt-nav-barre">
        <button className="vt-nav-marque" onClick={() => { setOuvert(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Haut de la page">
          <LogoEnfant taille={34} />
          <span className="vt-nav-nom"><span>Un enfant,</span> <em>un parcours d'éveil</em></span>
        </button>

        <nav className="vt-nav-liens" aria-label="Sections de la page">
          {LIENS.map((l) => (
            <button key={l.id} className={actif === l.id ? 'actif' : ''} aria-current={actif === l.id ? 'true' : undefined} onClick={() => aller(l.id)}>
              {l.libelle}
            </button>
          ))}
        </nav>

        <button className="vt-nav-cta" onClick={onEntrer}>{libelleCta} <Fleche /></button>
        <button className="vt-nav-burger" aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>
          <span /><span />
        </button>
      </div>

      {/* Menu mobile */}
      {ouvert && (
        <nav className="vt-nav-menu" aria-label="Menu">
          {LIENS.map((l) => (
            <button key={l.id} className={actif === l.id ? 'actif' : ''} onClick={() => aller(l.id)}>{l.libelle}</button>
          ))}
          <button className="vt-nav-menu-cta" onClick={() => { setOuvert(false); onEntrer(); }}>{libelleCta} <Fleche /></button>
        </nav>
      )}
    </header>
  );
}
