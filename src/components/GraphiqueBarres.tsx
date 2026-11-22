// Graphique en barres horizontales, dessiné en SVG (sans bibliothèque)

export interface Serie {
  nom: string;
  couleur: string;
}

export interface Barre {
  libelle: string;
  /** Une valeur par série (barres empilées) */
  valeurs: number[];
}

interface Props {
  titre: string;
  barres: Barre[];
  series?: Serie[];
  /** Valeur maximale de l'axe (sinon calculée) */
  max?: number;
  /** Format d'affichage du total, ex. pourcentages */
  format?: (v: number) => string;
}

const HAUTEUR_BARRE = 16;
const ECART = 20;
const LARGEUR_LIBELLE = 120;
const LARGEUR = 520;

export default function GraphiqueBarres({ titre, barres, series = [{ nom: 'Total', couleur: 'var(--orange)' }], max, format = String }: Props) {
  const totaux = barres.map((b) => b.valeurs.reduce((a, v) => a + v, 0));
  const maxi = max ?? Math.max(1, ...totaux);
  const zone = LARGEUR - LARGEUR_LIBELLE - 50;
  const hauteur = barres.length * (HAUTEUR_BARRE + ECART) + ECART;

  return (
    <figure className="graphique carte">
      <figcaption>{titre}</figcaption>
      {series.length > 1 && (
        <div className="legende">
          {series.map((s) => (
            <span key={s.nom}><i style={{ background: s.couleur }} />{s.nom}</span>
          ))}
        </div>
      )}
      {barres.length === 0 ? (
        <p className="vide">Aucune donnée.</p>
      ) : (
        <svg viewBox={`0 0 ${LARGEUR} ${hauteur}`} role="img" aria-label={titre}>
          {barres.map((b, i) => {
            const y = ECART + i * (HAUTEUR_BARRE + ECART);
            let x = LARGEUR_LIBELLE;
            return (
              <g key={b.libelle + i}>
                <text x={LARGEUR_LIBELLE - 8} y={y + HAUTEUR_BARRE / 2} textAnchor="end" dominantBaseline="central" className="g-libelle">
                  {b.libelle}
                </text>
                <rect x={LARGEUR_LIBELLE} y={y} width={zone} height={HAUTEUR_BARRE} rx={HAUTEUR_BARRE / 2} className="g-fond" />
                {b.valeurs.map((v, j) => {
                  const l = (v / maxi) * zone;
                  const r = <rect key={j} x={x} y={y} width={Math.max(0, l)} height={HAUTEUR_BARRE} fill={series[j]?.couleur} rx={l > 8 ? HAUTEUR_BARRE / 2 : 0}><title>{`${series[j]?.nom ?? ''} : ${format(v)}`}</title></rect>;
                  x += l;
                  return r;
                })}
                <text x={x + 6} y={y + HAUTEUR_BARRE / 2} dominantBaseline="central" className="g-valeur">
                  {format(totaux[i])}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </figure>
  );
}
