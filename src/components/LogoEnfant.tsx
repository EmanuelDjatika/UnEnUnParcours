/** Logo « l'heure à venir » : silhouette seule (petits emplacements) */
export default function LogoEnfant({ taille = 48 }: { taille?: number }) {
  return <img className="logo-icone" src="/logo-icone.png" width={taille} height={taille} alt="" aria-hidden="true" />;
}

/** Logo complet « l'heure à venir » : silhouette et nom */
export function LogoComplet({ hauteur = 48 }: { hauteur?: number }) {
  // Proportions de /logo.png : 1188 × 768
  return <img className="logo-complet" src="/logo.png" height={hauteur} width={Math.round((hauteur * 1188) / 768)} alt="l'heure à venir" />;
}
