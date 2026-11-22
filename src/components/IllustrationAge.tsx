import type { TrancheId } from '../types';

const PEAU = '#B97A4C';
const CHEVEUX = '#2B1B14';
const TRAIT = '#1E2A4A';

/** Petit visage commun (yeux + sourire), centré en (cx, cy) */
function Visage({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const e = r * 0.38;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={PEAU} />
      <circle cx={cx - e} cy={cy - r * 0.05} r={r * 0.12} fill={TRAIT} />
      <circle cx={cx + e} cy={cy - r * 0.05} r={r * 0.12} fill={TRAIT} />
      <path d={`M${cx - r * 0.3} ${cy + r * 0.32}q${r * 0.3} ${r * 0.28} ${r * 0.6} 0`} fill="none" stroke={TRAIT} strokeWidth={r * 0.1} strokeLinecap="round" />
    </g>
  );
}

/**
 * Illustration de l'enfant selon sa classe d'âge :
 * 0-1 an bébé emmailloté · 1-2 ans premiers pas avec un ballon · 2-3 ans tour de cubes
 * 3-4 ans couettes et crayon · 4-5 ans cartable, prêt pour le préscolaire
 */
export default function IllustrationAge({ tranche, couleur, taille = 56 }: { tranche: TrancheId; couleur: string; taille?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={taille} height={taille} aria-hidden="true" className="illu-age">
      <circle cx="32" cy="32" r="31" fill={couleur} opacity="0.12" />
      {tranche === 0 && (
        <g>
          {/* pagne d'emmaillotage */}
          <ellipse cx="32" cy="41" rx="15" ry="13" fill={couleur} />
          <path d="M20 36q12 8 24 0" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
          <Visage cx={32} cy={25} r={10} />
          <circle cx="32" cy="18" r="2.2" fill={CHEVEUX} />
          {/* tétine */}
          <circle cx="32" cy="30" r="2.4" fill="#fff" stroke={couleur} strokeWidth="1.2" />
        </g>
      )}
      {tranche === 1 && (
        <g>
          {/* corps qui marche */}
          <rect x="25" y="32" width="14" height="14" rx="6" fill={couleur} />
          <rect x="26" y="44" width="4.5" height="9" rx="2.2" fill={PEAU} />
          <rect x="33.5" y="44" width="4.5" height="9" rx="2.2" fill={PEAU} />
          <Visage cx={32} cy={23} r={9} />
          <path d="M30 14q2-4 5 0" fill="none" stroke={CHEVEUX} strokeWidth="2.4" strokeLinecap="round" />
          {/* ballon */}
          <circle cx="48" cy="48" r="6" fill="#fff" stroke={couleur} strokeWidth="2" />
          <path d="M42 48h12M48 42v12" stroke={couleur} strokeWidth="1.4" />
        </g>
      )}
      {tranche === 2 && (
        <g>
          <rect x="15" y="33" width="15" height="16" rx="6" fill={couleur} />
          <Visage cx={22.5} cy={24} r={9} />
          <path d="M14.5 21a8 8 0 0 1 16 0" fill={CHEVEUX} />
          {/* tour de cubes */}
          <rect x="38" y="44" width="11" height="9" rx="2" fill={couleur} />
          <rect x="39.5" y="35" width="8" height="9" rx="2" fill="#fff" stroke={couleur} strokeWidth="1.8" />
          <rect x="40.5" y="27.5" width="6" height="7.5" rx="1.6" fill={couleur} opacity="0.7" />
        </g>
      )}
      {tranche === 3 && (
        <g>
          <rect x="24" y="35" width="16" height="17" rx="6" fill={couleur} />
          {/* couettes */}
          <circle cx="20.5" cy="18" r="5" fill={CHEVEUX} />
          <circle cx="43.5" cy="18" r="5" fill={CHEVEUX} />
          <Visage cx={32} cy={25} r={10} />
          <path d="M22.5 22a9.5 9.5 0 0 1 19 0" fill={CHEVEUX} />
          {/* crayon */}
          <g transform="rotate(-35 47 44)">
            <rect x="44" y="36" width="5" height="16" rx="1" fill="#fff" stroke={couleur} strokeWidth="1.6" />
            <path d="M44 52l2.5 5 2.5-5z" fill={couleur} />
          </g>
        </g>
      )}
      {tranche === 4 && (
        <g>
          {/* cartable */}
          <rect x="17" y="34" width="12" height="15" rx="3" fill={couleur} opacity="0.75" />
          <rect x="24" y="34" width="17" height="18" rx="6" fill={couleur} />
          <path d="M27 35v8M38 35v8" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
          <Visage cx={32.5} cy={23} r={10} />
          <path d="M22.5 20.5a10 10 0 0 1 20 0" fill={CHEVEUX} />
          <circle cx="25" cy="17" r="3" fill={CHEVEUX} />
          <circle cx="32.5" cy="14.5" r="3.2" fill={CHEVEUX} />
          <circle cx="40" cy="17" r="3" fill={CHEVEUX} />
        </g>
      )}
    </svg>
  );
}
