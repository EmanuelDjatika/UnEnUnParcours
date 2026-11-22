interface Props {
  libelle: string;
  valeur: string;
  /** Libellé de l'option « aucun filtre » ; si absent, pas d'option vide */
  tous?: string;
  options: { id: string; nom: string }[];
  onChange: (v: string) => void;
}

/** Pastille de filtre : libellé + valeur, avec une liste déroulante native par-dessus */
export default function FiltrePastille({ libelle, valeur, tous, options, onChange }: Props) {
  const choisi = options.find((o) => o.id === valeur);
  return (
    <label className={`pastille-filtre ${choisi && tous ? 'actif' : ''}`}>
      <span className="pf-libelle">{libelle}</span>
      <span className="pf-valeur">{choisi?.nom ?? tous}</span>
      <svg className="pf-chevron" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <select value={valeur} onChange={(e) => onChange(e.target.value)} aria-label={libelle}>
        {tous !== undefined && <option value="">{tous}</option>}
        {options.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
      </select>
    </label>
  );
}
