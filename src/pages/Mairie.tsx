import type { Store } from '../store/useStore';
import FormulaireNaissance from '../components/FormulaireNaissance';

/** Écran d'enregistrement d'une naissance (espace mairie) */
export default function Mairie({ store, villeFixe, onTermine }: { store: Store; villeFixe?: string; onTermine?: () => void }) {
  return (
    <div className="page">
      <FormulaireNaissance store={store} villeFixe={villeFixe} onTermine={onTermine} />
    </div>
  );
}
