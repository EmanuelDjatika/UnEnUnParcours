import { useState } from 'react';
import type { FormEvent } from 'react';
import { COMPTES } from '../data/comptes';
import type { Compte, Role } from '../data/comptes';

interface Props {
  /** Espace concerné ; absent = page de choix de l'espace */
  role?: Role;
  onConnecter: (identifiant: string, motDePasse: string) => Compte | null;
  onChoisirEspace: (role: Role) => void;
}

const ESPACES: Record<Role, { titre: string; texte: string; image: string }> = {
  admin: { titre: 'Administration', texte: 'Vue d\'ensemble de toutes les régions', image: '/eveil-hero.png' },
  mairie: { titre: 'Mairie', texte: 'Enregistrer les naissances de la ville', image: '/eveil-hero.png' },
  creche: { titre: 'Crèche', texte: 'Inviter les familles aux ateliers', image: '/creche-hero.png' },
};

/** Page de connexion propre à chaque espace (identifiants préremplis : prototype) */
export default function Connexion({ role, onConnecter, onChoisirEspace }: Props) {
  const compteParDefaut = COMPTES.find((c) => c.role === role);
  const [identifiant, setIdentifiant] = useState(compteParDefaut?.identifiant ?? '');
  const [motDePasse, setMotDePasse] = useState(compteParDefaut?.motDePasse ?? '');
  const [erreur, setErreur] = useState(false);

  function valider(e: FormEvent) {
    e.preventDefault();
    setErreur(!onConnecter(identifiant, motDePasse));
  }

  const espace = role ? ESPACES[role] : null;

  return (
    <div className="connexion">
      <section className="hero connexion-hero">
        <div className="hero-texte">
          <span className="hero-etiquette">{espace ? `Espace ${espace.titre}` : 'UNICEF Togo · Éveil du jeune enfant'}</span>
          <h1>Un enfant,<br />un parcours d'éveil</h1>
          <p>De la naissance au préscolaire, par le jeu</p>
        </div>
        <img className="hero-image" src={espace?.image ?? '/eveil-hero.png'} alt="" />
      </section>

      {!role ? (
        /* Choix de l'espace */
        <div className="connexion-carte">
          <h2>Choisir un espace</h2>
          {(Object.keys(ESPACES) as Role[]).map((r) => (
            <button key={r} className="choix-espace" onClick={() => onChoisirEspace(r)}>
              <strong>{ESPACES[r].titre}</strong>
              <span>{ESPACES[r].texte}</span>
              <span className="ce-fleche" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      ) : (
        <form className="connexion-carte" onSubmit={valider}>
          <h2>Connexion · {espace!.titre}</h2>

          <label className="champ"><span>Identifiant</span>
            <input autoComplete="username" required value={identifiant} onChange={(e) => { setIdentifiant(e.target.value); setErreur(false); }} />
          </label>
          <label className="champ"><span>Mot de passe</span>
            <input type="password" autoComplete="current-password" required value={motDePasse} onChange={(e) => { setMotDePasse(e.target.value); setErreur(false); }} />
          </label>
          {erreur && <p className="message erreur" role="alert">Identifiant ou mot de passe incorrect pour cet espace.</p>}
          <button type="submit" className="btn btn-principal btn-large">Se connecter</button>
          <p className="aide connexion-note">Prototype : les identifiants sont préremplis.</p>
        </form>
      )}
    </div>
  );
}
