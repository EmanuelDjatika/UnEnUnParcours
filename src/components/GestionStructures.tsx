import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Store } from '../store/useStore';
import type { Structure, TypeStructure } from '../types';
import EtiquetteStructure, { IconeStructure, LISTE_TYPES, TYPES_STRUCTURE } from './EtiquetteStructure';

/** Formulaire d'ajout / de modification d'une structure et de sa zone de couverture */
function FormulaireStructure({ store, structure, onFini }: { store: Store; structure: Structure | null; onFini: () => void }) {
  const { localites, quartiers, structures } = store.donnees;
  const [nom, setNom] = useState(structure?.nom ?? '');
  const [type, setType] = useState<TypeStructure>(structure?.type ?? 'creche');
  const [localiteId, setLocaliteId] = useState(structure?.localiteId ?? localites[0]?.id ?? '');
  const [animatrice, setAnimatrice] = useState(structure?.animatrice ?? '');
  const [choisis, setChoisis] = useState<string[]>(() => quartiers.filter((q) => structure && q.structureId === structure.id).map((q) => q.id));
  const [erreur, setErreur] = useState('');

  const quartiersVille = quartiers.filter((q) => q.localiteId === localiteId);
  const nomStructure = (id: string) => structures.find((s) => s.id === id)?.nom;

  /** Coche / décoche un quartier ; refuse s'il est déjà couvert par une autre structure */
  function basculer(qid: string) {
    const q = quartiers.find((x) => x.id === qid);
    if (!q) return;
    if (choisis.includes(qid)) {
      setChoisis(choisis.filter((x) => x !== qid));
      setErreur('');
      return;
    }
    const autre = q.structureId && q.structureId !== structure?.id ? nomStructure(q.structureId) : undefined;
    if (autre) {
      setErreur(`Le quartier ${q.nom} est déjà couvert par « ${autre} ». Un quartier ne peut appartenir qu'à une seule structure : retirez-le d'abord de cette structure.`);
      return;
    }
    setChoisis([...choisis, qid]);
    setErreur('');
  }

  function valider(e: FormEvent) {
    e.preventDefault();
    if (!nom.trim()) return setErreur('Indiquez le nom de la structure.');
    // Seuls les quartiers de la ville choisie sont gardés
    const ids = choisis.filter((id) => quartiersVille.some((q) => q.id === id));
    const r = store.enregistrerStructure({ id: structure?.id, nom: nom.trim(), type, localiteId, animatrice: animatrice.trim() || undefined }, ids);
    if ('conflits' in r) {
      setErreur(r.conflits.map((c) => `Le quartier ${c.quartier.nom} est déjà couvert par « ${c.structure.nom} ».`).join(' ') + " Un quartier ne peut appartenir qu'à une seule structure.");
      return;
    }
    onFini();
  }

  return (
    <form className="jeu-form" onSubmit={valider}>
      <h2>{structure ? 'Modifier la structure' : 'Nouvelle structure'}</h2>
      <label className="champ"><span>Nom</span>
        <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. École préscolaire de Bè" />
      </label>

      <div className="champ"><span>Type</span>
        <div className="format-choix type-choix" role="radiogroup">
          {LISTE_TYPES.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={type === t} className={type === t ? 'actif' : ''}
              style={type === t ? { color: TYPES_STRUCTURE[t].couleur } : undefined} onClick={() => setType(t)}>
              <IconeStructure type={t} taille={16} /> {TYPES_STRUCTURE[t].libelle}
            </button>
          ))}
        </div>
      </div>

      <div className="grille">
        <label className="champ"><span>Ville</span>
          <select value={localiteId} onChange={(e) => { setLocaliteId(e.target.value); setErreur(''); }}>
            {localites.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
          </select>
        </label>
        <label className="champ"><span>Animatrice</span>
          <input value={animatrice} onChange={(e) => setAnimatrice(e.target.value)} placeholder="Nom et prénom" />
        </label>
      </div>

      <div className="champ"><span>Quartiers couverts</span>
        {quartiersVille.length === 0 ? <p className="aide">Aucun quartier dans cette ville.</p> : (
          <ul className="quartiers-choix">
            {quartiersVille.map((q) => {
              const autre = q.structureId && q.structureId !== structure?.id ? nomStructure(q.structureId) : undefined;
              return (
                <li key={q.id}>
                  <label className={choisis.includes(q.id) ? 'actif' : ''}>
                    <input type="checkbox" checked={choisis.includes(q.id)} onChange={() => basculer(q.id)} />
                    <span>{q.nom}</span>
                    <small>{autre ? `déjà couvert : ${autre}` : choisis.includes(q.id) ? '' : 'libre'}</small>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {erreur && <p className="message erreur" role="alert">{erreur}</p>}
      <div className="actions">
        <button type="button" className="btn-sobre" onClick={onFini}>Annuler</button>
        <button type="submit" className="btn-sobre principal">Enregistrer</button>
      </div>
    </form>
  );
}

/** Fenêtre de gestion : liste des structures, ajout et modification */
export default function GestionStructures({ store, onFermer }: { store: Store; onFermer: () => void }) {
  const { structures, quartiers, localites } = store.donnees;
  // undefined : liste ; null : nouvelle structure ; Structure : modification
  const [edition, setEdition] = useState<Structure | null | undefined>(undefined);

  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [onFermer]);

  return (
    <div className="modal-fond" onClick={onFermer}>
      <div className="fenetre" role="dialog" aria-modal="true" aria-label="Gérer les structures" onClick={(e) => e.stopPropagation()}>
        <button className="fenetre-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        {edition !== undefined ? (
          <FormulaireStructure key={edition?.id ?? 'nouvelle'} store={store} structure={edition} onFini={() => setEdition(undefined)} />
        ) : (
          <div className="jeu-form">
            <h2>Structures</h2>
            <ul className="structures-liste">
              {structures.map((s) => {
                const qs = quartiers.filter((q) => q.structureId === s.id).map((q) => q.nom);
                return (
                  <li key={s.id}>
                    <button className="jeu-ligne" onClick={() => setEdition(s)}>
                      <span className="structure-infos">
                        <span className="jeu-nom">{s.nom}</span>
                        <span className="tdb-detail">
                          {localites.find((l) => l.id === s.localiteId)?.nom} · {qs.length ? qs.join(', ') : 'aucun quartier'}{s.animatrice ? ` · ${s.animatrice}` : ''}
                        </span>
                      </span>
                      <EtiquetteStructure type={s.type} />
                      <span aria-hidden="true">›</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button className="jeux-ajouter" onClick={() => setEdition(null)}>+ Ajouter une structure</button>
          </div>
        )}
      </div>
    </div>
  );
}
