import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { useSession } from './store/useSession';
import { ACCUEIL } from './data/comptes';
import type { Compte, Role } from './data/comptes';
import Connexion from './pages/Connexion';
import Presentation from './pages/Presentation';
import Mairie from './pages/Mairie';
import Structures from './pages/Structures';
import Jeux from './pages/Jeux';
import TableauDeBord from './pages/TableauDeBord';
import ListeEnfants from './components/ListeEnfants';
import LogoEnfant from './components/LogoEnfant';

/*
  Trois espaces, chacun avec ses chemins :
  - Administration : /admin, /admin/enfants, /admin/prescolaire, /admin/structures
  - Mairie         : /mairie, /mairie/enregistrer, /mairie/enfants, /mairie/prescolaire
  - Structure      : /structure, /structure/jeux (crèche, école préscolaire ou centre social)
  Sans connexion   : /connexion
*/

/** Chemins autorisés pour un compte */
function cheminsAutorises(c: Compte): string[] {
  if (c.role === 'admin') return ['/admin', '/admin/enfants', '/admin/prescolaire', '/admin/structures'];
  if (c.role === 'mairie') return ['/mairie', '/mairie/enregistrer', '/mairie/enfants', '/mairie/prescolaire'];
  return ['/structure', '/structure/jeux'];
}

const cheminActuel = () => window.location.pathname.replace(/\/+$/, '') || '/';

export default function App() {
  const store = useStore();
  const { compte, connecter, deconnecter } = useSession();
  const [chemin, setChemin] = useState(cheminActuel);

  const aller = (c: string, remplacer = false) => {
    if (c !== window.location.pathname) window.history[remplacer ? 'replaceState' : 'pushState'](null, '', c);
    setChemin(c);
    window.scrollTo(0, 0);
  };

  // Boutons Précédent / Suivant du navigateur
  useEffect(() => {
    const f = () => setChemin(cheminActuel());
    window.addEventListener('popstate', f);
    return () => window.removeEventListener('popstate', f);
  }, []);

  // Espace visé par l'adresse : /admin…, /mairie…, /structure…
  const roleChemin: Role | undefined = (['admin', 'mairie', 'structure'] as Role[]).find((r) => chemin === ACCUEIL[r] || chemin.startsWith(ACCUEIL[r] + '/'));
  const pageConnexion = chemin === '/connexion' || chemin.endsWith('/connexion');

  // Garde :
  // - pas connecté → page de connexion de l'espace visé (ou choix de l'espace) ;
  // - connecté sur une page de connexion de son espace → accueil de son espace ;
  // - connecté sur un chemin d'un autre espace → page de connexion de cet espace.
  let cible: string;
  // « / » : page de présentation du projet, ouverte à tous
  if (chemin === '/') cible = '/';
  else if (!compte || (roleChemin && roleChemin !== compte.role)) cible = roleChemin ? `${ACCUEIL[roleChemin]}/connexion` : '/connexion';
  else if (pageConnexion || !cheminsAutorises(compte).includes(chemin)) cible = ACCUEIL[compte.role];
  else cible = chemin;
  useEffect(() => {
    if (cible !== chemin) aller(cible, true);
  });

  if (cible === '/') {
    return <Presentation onEntrer={() => aller(compte ? ACCUEIL[compte.role] : '/connexion')} connecte={!!compte} />;
  }
  if (cible.endsWith('/connexion')) {
    const roleConnexion = cible === '/connexion' ? undefined : roleChemin;
    return (
      <div className="app app-connexion">
        <Connexion key={roleConnexion ?? 'choix'} role={roleConnexion}
          onChoisirEspace={(r) => aller(`${ACCUEIL[r]}/connexion`)}
          onRetour={() => aller('/connexion')}
          onAccueil={() => aller('/')}
          onConnecter={(id, mdp) => {
            // On n'accepte que les comptes de l'espace de cette page
            const c = connecter(id, mdp, roleConnexion);
            if (!c) return null;
            aller(ACCUEIL[c.role]);
            return c;
          }} />
      </div>
    );
  }
  if (!compte) return null;

  const accueil = ACCUEIL[compte.role];
  const surAccueil = cible === '/admin' || cible === '/mairie';
  const base = compte.role === 'admin' ? '/admin' : '/mairie';

  return (
    <div className={`app ${surAccueil ? '' : 'fond-blanc'}`}>
      {/* Barre du compte : logo (retour à l'accueil de l'espace), nom, déconnexion */}
      <div className="barre-compte non-imprime">
        <button className="bc-logo" onClick={() => aller(accueil)} title="Accueil de mon espace">
          <LogoEnfant taille={40} />
          <span>{compte.nom}</span>
        </button>
        {/* Navigation de l'espace structure */}
        {compte.role === 'structure' && (
          <nav className="bc-nav" aria-label="Espace structure">
            <button className={cible === '/structure' ? 'actif' : ''} onClick={() => aller('/structure')}>Familles</button>
            <button className={cible === '/structure/jeux' ? 'actif' : ''} onClick={() => aller('/structure/jeux')}>Jeux</button>
          </nav>
        )}
        <button className="bc-deco" onClick={() => { const r = compte.role; deconnecter(); aller(`${ACCUEIL[r]}/connexion`); }}>Se déconnecter</button>
      </div>

      {/* Bandeau illustré sur l'accueil de l'administration et de la mairie */}
      {surAccueil && (
        <header className="hero non-imprime">
          <div className="hero-texte">
            <span className="hero-etiquette">{compte.nom}</span>
            <h1>Un enfant,<br />un parcours d'éveil</h1>
            <p>De la naissance au préscolaire, par le jeu</p>
            {/* Administration : accès aux structures et ateliers depuis le bandeau */}
            {compte.role === 'admin' && <button className="tdb-secondaire hero-bouton" onClick={() => aller('/admin/structures')}>Structures et ateliers ›</button>}
          </div>
          <img className="hero-image" src="/eveil-hero.png" alt="Une maman et son enfant jouent avec un tuyau à balle fabriqué en carton" />
        </header>
      )}

      <main>
        {/* Administration : tout voir, sans enregistrer */}
        {cible === '/admin' && (
          <TableauDeBord store={store} onStructures={() => aller('/admin/structures')}
            onEnfants={(p) => aller(p ? '/admin/prescolaire' : '/admin/enfants')} />
        )}
        {cible === '/admin/structures' && <Structures store={store} />}

        {/* Mairie : sa ville seulement */}
        {cible === '/mairie' && (
          <TableauDeBord store={store} villeFixe={compte.localiteId} onEnregistrer={() => aller('/mairie/enregistrer')}
            onEnfants={(p) => aller(p ? '/mairie/prescolaire' : '/mairie/enfants')} />
        )}
        {cible === '/mairie/enregistrer' && <Mairie store={store} villeFixe={compte.localiteId} onTermine={() => aller('/mairie')} />}

        {/* Listes d'enfants (admin : tout ; mairie : sa ville) */}
        {(cible === `${base}/enfants` || cible === `${base}/prescolaire`) && (
          <div className="page">
            <ListeEnfants key={cible} store={store} prescolaire={cible.endsWith('prescolaire')}
              villeFixe={compte.role === 'mairie' ? compte.localiteId : undefined} />
          </div>
        )}

        {/* Structure : sa zone seulement */}
        {cible === '/structure' && <Structures store={store} structureFixe={compte.structureId} />}
        {cible === '/structure/jeux' && <Jeux store={store} />}
      </main>
    </div>
  );
}
