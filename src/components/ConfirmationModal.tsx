import { useEffect } from 'react';

interface Props {
  ouvert: boolean;
  titre: string;
  message: string;
  libelleConfirmer?: string;
  danger?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
}

/** Fenêtre de confirmation dans la page (remplace confirm() du navigateur) */
export default function ConfirmationModal({ ouvert, titre, message, libelleConfirmer = 'Confirmer', danger, onConfirmer, onAnnuler }: Props) {
  // Touche Échap pour fermer
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onAnnuler();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [ouvert, onAnnuler]);

  if (!ouvert) return null;
  return (
    <div className="modal-fond" onClick={onAnnuler}>
      <div className="modal carte" role="dialog" aria-modal="true" aria-labelledby="modal-titre" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-titre">{titre}</h2>
        <p>{message}</p>
        <div className="actions">
          <button className="btn btn-secondaire" onClick={onAnnuler} autoFocus>Annuler</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-principal'}`} onClick={onConfirmer}>{libelleConfirmer}</button>
        </div>
      </div>
    </div>
  );
}
