/** Logo : visage d'enfant souriant, dessiné en SVG */
export default function LogoEnfant({ taille = 48 }: { taille?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={taille} height={taille} aria-hidden="true">
      {/* fond */}
      <circle cx="32" cy="32" r="31" fill="#FCE9CF" />
      {/* oreilles */}
      <circle cx="13" cy="35" r="5" fill="#A8693F" />
      <circle cx="51" cy="35" r="5" fill="#A8693F" />
      {/* visage */}
      <circle cx="32" cy="35" r="18" fill="#B97A4C" />
      {/* cheveux bouclés */}
      <g fill="#2B1B14">
        <circle cx="20" cy="22" r="6" />
        <circle cx="27" cy="17" r="6.5" />
        <circle cx="35" cy="16" r="6.5" />
        <circle cx="43" cy="20" r="6" />
        <circle cx="47" cy="27" r="4.5" />
        <circle cx="17" cy="28" r="4.5" />
      </g>
      {/* yeux */}
      <circle cx="25.5" cy="35" r="2.6" fill="#1E2A4A" />
      <circle cx="38.5" cy="35" r="2.6" fill="#1E2A4A" />
      <circle cx="26.3" cy="34.2" r="0.8" fill="#fff" />
      <circle cx="39.3" cy="34.2" r="0.8" fill="#fff" />
      {/* joues */}
      <circle cx="21.5" cy="41" r="2.8" fill="#E07B00" opacity="0.35" />
      <circle cx="42.5" cy="41" r="2.8" fill="#E07B00" opacity="0.35" />
      {/* sourire */}
      <path d="M26 42.5c2.2 3.6 9.8 3.6 12 0" fill="none" stroke="#1E2A4A" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
