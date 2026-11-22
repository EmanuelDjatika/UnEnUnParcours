import { useCallback, useState } from 'react';
import { COMPTES } from '../data/comptes';
import type { Compte, Role } from '../data/comptes';

const CLE = 'un-enfant-un-parcours-eveil:session';

function lire(): Compte | null {
  try {
    const id = localStorage.getItem(CLE);
    return COMPTES.find((c) => c.identifiant === id) ?? null;
  } catch {
    return null;
  }
}

/** Compte connecté (gardé sur l'appareil jusqu'à la déconnexion) */
export function useSession() {
  const [compte, setCompte] = useState<Compte | null>(lire);

  const connecter = useCallback((identifiant: string, motDePasse: string, role?: Role): Compte | null => {
    // role : on n'accepte que les comptes de l'espace demandé
    const c = COMPTES.find((x) => x.identifiant === identifiant.trim().toLowerCase() && x.motDePasse === motDePasse && (!role || x.role === role));
    if (!c) return null;
    try { localStorage.setItem(CLE, c.identifiant); } catch { /* session en mémoire seulement */ }
    setCompte(c);
    return c;
  }, []);

  const deconnecter = useCallback(() => {
    try { localStorage.removeItem(CLE); } catch { /* rien */ }
    setCompte(null);
  }, []);

  return { compte, connecter, deconnecter };
}
