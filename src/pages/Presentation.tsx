import { useEffect, useState } from 'react';
import LogoEnfant from '../components/LogoEnfant';
import NavVitrine, { allerA } from '../components/NavVitrine';
import { IconeStructure } from '../components/EtiquetteStructure';

/** Les trois étapes du parcours, de la naissance à l'atelier */
const ETAPES = [
  { num: '1', titre: 'La mairie enregistre la naissance', texte: "Avec l'accord du parent, l'enfant est inscrit dès sa naissance, dans son quartier." },
  { num: '2', titre: 'La structure du quartier est prévenue', texte: "Crèche, école préscolaire ou centre social : elle reçoit la fiche et appelle la famille." },
  { num: '3', titre: "L'enfant joue et grandit", texte: "Chaque mois, parents et enfants fabriquent ensemble des jeux adaptés à son âge." },
];

/** Jeux réellement fabriqués en carton recyclé (photos dans /public/jouets) */
const JOUETS = [
  // portrait : photo en hauteur, affichée plus étroite pour tenir sous l'arche
  { image: '/jouets/labyrinthe.jpg', nom: 'Le labyrinthe' },
  { image: '/jouets/tour-des-nombres.jpg', nom: 'La tour des nombres', portrait: true },
  { image: '/jouets/boite-a-compter.jpg', nom: 'La boîte à compter' },
  { image: '/jouets/puzzle-animaux.jpg', nom: 'Le puzzle des animaux' },
  { image: '/jouets/tri-couleurs.jpg', nom: 'Le tri des couleurs' },
];

/** Arche où les jeux se succèdent en fondu, toutes les 3 secondes */
function JeuQuiChange() {
  const [actif, setActif] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActif((i) => (i + 1) % JOUETS.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <figure className="vt-arche vt-arche-jeux">
      <div className="vt-arche-image">
        {/* Chaque jeu est affiché en entier, comme une carte posée sur fond kraft */}
        {JOUETS.map((j, i) => (
          <div key={j.image} className={`vt-diapo ${i === actif ? 'actif' : ''}`}>
            <img className={`vt-diapo-jeu ${'portrait' in j ? 'portrait' : ''}`} src={j.image} alt={i === actif ? j.nom : ''} />
          </div>
        ))}
      </div>
      <figcaption aria-live="polite">
        <span className="vt-arche-etiquette">Après</span>
        <strong key={actif} className="vt-arche-nom">{JOUETS[actif].nom}</strong>
        <span className="vt-points" aria-hidden="true">
          {JOUETS.map((j, i) => <i key={j.nom} className={i === actif ? 'actif' : ''} />)}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Page de présentation du projet (adresse « / »), ouverte à tous.
 * onEntrer : vers le choix de l'espace, ou vers son espace si déjà connecté.
 */
export default function Presentation({ onEntrer, connecte }: { onEntrer: () => void; connecte: boolean }) {
  const cta = connecte ? 'Ouvrir mon espace' : 'Accéder à la plateforme';
  return (
    <div className="vitrine">
      <NavVitrine onEntrer={onEntrer} connecte={connecte} />

      {/* Bandeau principal */}
      <section className="vt-hero">
        <img className="vt-hero-image" src="/eveil-hero.png" alt="Une maman et son enfant jouent avec un tuyau à balle fabriqué en carton" />
        <div className="vt-hero-texte">
          <span className="vt-surtitre">UNICEF Togo · Éveil du jeune enfant</span>
          <h1>Un enfant,<br />un parcours d'éveil</h1>
          <p className="vt-accroche">
            Chaque enfant a droit à l'éveil, grâce à des jeux faits maison
            avec des <strong>cartons recyclés</strong>.
          </p>
          <div className="vt-hero-actions">
            <button className="btn btn-principal btn-large vt-cta" onClick={onEntrer}>{cta}</button>
            <button className="vt-hero-lien" onClick={() => allerA('fait-maison')}>
              Découvrir le projet
            </button>
          </div>
        </div>
      </section>

      {/* Les cartons deviennent des jeux */}
      <section className="vt-section vt-transfo" id="fait-maison">
        <div className="vt-transfo-texte">
          <span className="vt-surtitre">Fait maison</span>
          <h2>Les cartons deviennent des jeux.</h2>
          <p>Une boîte, un peu de colle, une image : en atelier, chaque famille fabrique les jeux qui éveillent son enfant.</p>
        </div>
        <div className="vt-duo">
          <figure className="vt-arche vt-arche-cartons">
            <div className="vt-arche-image"><img src="/jouets/cartons.jpg" alt="Des cartons usagés" /></div>
            <figcaption><span className="vt-arche-etiquette">Avant</span><strong>Des cartons usagés</strong></figcaption>
          </figure>
          {/* Flèche courbe en pointillés, des cartons vers le jeu */}
          <svg className="vt-duo-fleche" viewBox="0 0 140 70" aria-hidden="true">
            <path className="trait" d="M8 60 C 38 4, 96 2, 126 36" />
            <path d="M113 36 L127 38 L126 24" />
          </svg>
          <JeuQuiChange />
        </div>
      </section>

      {/* Le constat et la réponse */}
      <section className="vt-section vt-intro" id="pourquoi">
        <span className="vt-surtitre">Pourquoi</span>
        <h2>Jouer, c'est apprendre.</h2>
        <p>
          Les premières années comptent plus que toutes les autres. Mais les jouets coûtent cher.
          Avec des cartons, des bouteilles et des bouchons, les familles fabriquent elles-mêmes
          des jeux qui éveillent les sens, le langage et la curiosité de leur enfant.
        </p>
      </section>

      {/* Le parcours */}
      <section className="vt-section" id="parcours">
        <span className="vt-surtitre">Comment</span>
        <h2>Le parcours</h2>
        <ol className="vt-etapes">
          {ETAPES.map((e) => (
            <li key={e.num}>
              <span className="vt-num">{e.num}</span>
              <h3>{e.titre}</h3>
              <p>{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Les ateliers */}
      <section className="vt-section vt-ateliers" id="ateliers">
        <img src="/creche-hero.png" alt="Des enfants jouent aux cubes avec une animatrice" />
        <div>
          <span className="vt-surtitre">Où</span>
          <h2>Des ateliers près de chez soi</h2>
          <p>Chaque quartier est couvert par une structure qui organise un atelier par mois, par classe d'âge.</p>
          <ul className="vt-types">
            <li><IconeStructure type="creche" taille={20} couleur="#E07B00" /> Crèches</li>
            <li><IconeStructure type="ecole_prescolaire" taille={20} couleur="#2E86DE" /> Écoles préscolaires</li>
            <li><IconeStructure type="centre_social" taille={20} couleur="#2E9E4F" /> Centres sociaux</li>
          </ul>
        </div>
      </section>


      {/* Appel final */}
      <section className="vt-fin">
        <h2>De la naissance au préscolaire, par le jeu.</h2>
        <button className="btn btn-principal btn-large vt-cta" onClick={onEntrer}>{cta}</button>
      </section>

      {/* Pied de page sobre : marque et liens, puis mentions */}
      <footer className="vt-pied">
        <div className="vt-pied-haut">
          <div className="vt-pied-marque">
            <LogoEnfant taille={32} />
            <div>
              <strong>Un enfant, un parcours d'éveil</strong>
              <span>Des jeux d'éveil en carton recyclé, pour chaque enfant.</span>
            </div>
          </div>
          <nav className="vt-pied-liens" aria-label="Pied de page">
            <button onClick={() => allerA('fait-maison')}>Le projet</button>
            <button onClick={onEntrer}>{connecte ? 'Mon espace' : 'Se connecter'}</button>
          </nav>
        </div>
        <div className="vt-pied-bas">
          <span>© {new Date().getFullYear()} · Prototype réalisé pour le hackathon UNICEF Togo</span>        </div>
      </footer>
    </div>
  );
}
