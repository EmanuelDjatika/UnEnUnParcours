import { useState } from 'react';
import type { FormEvent } from 'react';
import { COMPTES } from '../data/comptes';
import type { Compte, Role } from '../data/comptes';
import LogoEnfant from '../components/LogoEnfant';

interface Props {
  /** Espace concerné ; absent = page de choix de l'espace */
  role?: Role;
  onConnecter: (identifiant: string, motDePasse: string) => Compte | null;
  onChoisirEspace: (role: Role) => void;
  /** Retour au choix de l'espace */
  onRetour?: () => void;
  /** Retour à la page de présentation */
  onAccueil?: () => void;
}

const ESPACES: Record<Role, { titre: string; texte: string; image: string }> = {
  admin: { titre: 'Administration', texte: 'Vue d\'ensemble de toutes les régions', image: '/eveil-hero.png' },
  mairie: { titre: 'Mairie', texte: 'Enregistrer les naissances de la ville', image: '/eveil-hero.png' },
  structure: { titre: 'Structure', texte: 'Crèche, école préscolaire ou centre social', image: '/creche-hero.png' },
};

/** Page de connexion propre à chaque espace (identifiants préremplis : prototype) */
export default function Connexion({ role, onConnecter, onChoisirEspace, onRetour, onAccueil }: Props) {
  const compteParDefaut = COMPTES.find((c) => c.role === role);
  const [identifiant, setIdentifiant] = useState(compteParDefaut?.identifiant ?? '');
  const [motDePasse, setMotDePasse] = useState(compteParDefaut?.motDePasse ?? '');
  const [erreur, setErreur] = useState(false);

  function valider(e: FormEvent) {
    e.preventDefault();
    setErreur(!onConnecter(identifiant, motDePasse));
  }

  const espace = role ? ESPACES[role] : null;

  // Comptes de cet espace (ex. les 4 structures) : choix rapide en pastilles
  const comptesEspace = COMPTES.filter((c) => c.role === role);
  const choisirCompte = (c: Compte) => { setIdentifiant(c.identifiant); setMotDePasse(c.motDePasse); setErreur(false); };

  return (
    <div className="connexion">
      {/* Panneau illustré, avec le titre posé sur l'image */}
      <section className="cx-visuel">
        <img src={espace?.image ?? '/eveil-hero.png'} alt="" />
        <div className="cx-visuel-texte">
          <h1>Un enfant,<br />un parcours d'éveil</h1>
          <p>De la naissance au préscolaire, par le jeu</p>
        </div>
      </section>

      {/* Panneau du formulaire */}
      <section className="cx-panneau">
        <div className="cx-contenu">
          <button type="button" className="cx-logo" onClick={onAccueil} aria-label="Présentation du projet"><LogoEnfant taille={52} /></button>
          {!role ? (
            <>
              <div className="cx-tete">
                <h2>Bienvenue</h2>
                <p>Choisissez votre espace pour continuer.</p>
              </div>
              <div className="cx-espaces">
                {(Object.keys(ESPACES) as Role[]).map((r) => (
                  <button key={r} className="choix-espace" onClick={() => onChoisirEspace(r)}>
                    <strong>{ESPACES[r].titre}</strong>
                    <span>{ESPACES[r].texte}</span>
                    <span className="ce-fleche" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <form className="cx-form" onSubmit={valider}>
              <div className="cx-tete">
                <span className="cx-espace">Espace {espace!.titre}</span>
                <h2>Connexion</h2>
                <p>{espace!.texte}</p>
              </div>

              {comptesEspace.length > 1 && (
                <div className="comptes-choix" role="group" aria-label="Compte">
                  {comptesEspace.map((c) => (
                    <button key={c.identifiant} type="button" className={c.identifiant === identifiant ? 'actif' : ''} onClick={() => choisirCompte(c)}>{c.nom}</button>
                  ))}
                </div>
              )}

              <label className="champ"><span>Identifiant</span>
                <input autoComplete="username" required value={identifiant} onChange={(e) => { setIdentifiant(e.target.value); setErreur(false); }} />
              </label>
              <label className="champ"><span>Mot de passe</span>
                <input type="password" autoComplete="current-password" required value={motDePasse} onChange={(e) => { setMotDePasse(e.target.value); setErreur(false); }} />
              </label>
              {erreur && <p className="message erreur" role="alert">Identifiant ou mot de passe incorrect pour cet espace.</p>}
              <button type="submit" className="btn btn-principal btn-large">Se connecter</button>
              <p className="connexion-note">Prototype : identifiants préremplis.</p>
              {onRetour && <button type="button" className="cx-retour" onClick={onRetour}>‹ Changer d'espace</button>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
