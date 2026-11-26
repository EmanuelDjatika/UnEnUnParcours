import type { TrancheId } from '../types';

/**
 * Illustration de l'enfant selon sa classe d'âge (images rondes dans /public/ages) :
 * 0-1 an à plat ventre avec un hochet · 1-2 ans anneaux à empiler · 2-3 ans dessin aux crayons
 * 3-4 ans tour de cubes · 4-5 ans livre d'images · (age-5.png : 5 ans, cartable, prêt pour l'école)
 */
export default function IllustrationAge({ tranche, taille = 56 }: { tranche: TrancheId; couleur?: string; taille?: number }) {
  return <img className="illu-age" src={`/ages/age-${tranche}.png`} width={taille} height={taille} alt="" aria-hidden="true" />;
}
