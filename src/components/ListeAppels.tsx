import type { Enfant, Presence, TrancheId } from '../types';
import { estPrescolaire, libelleTranche, texteAge } from '../utils/age';

interface Props {
  tranche: TrancheId;
  enfants: Enfant[];
  jeux: string[];
  mois: string;
  dateRef: Date;
  presences: Presence[];
  onChange: (enfantId: string, champ: 'appele' | 'confirme' | 'venu', valeur: boolean) => void;
}

/** Liste d'appels d'un groupe d'âge, pour l'animatrice */
export default function ListeAppels({ tranche, enfants, jeux, mois, dateRef, presences, onChange }: Props) {
  const p = (id: string) => presences.find((x) => x.enfantId === id && x.mois === mois);
  const venus = enfants.filter((e) => p(e.id)?.venu).length;

  // Groupe vide : on ne l'affiche pas, pour garder l'écran sobre
  if (enfants.length === 0) return null;

  return (
    <section className="carte groupe">
      <header className="groupe-tete">
        <h3>{libelleTranche(tranche)} <span className="groupe-nb">{enfants.length} enfant{enfants.length > 1 ? 's' : ''}</span></h3>
        <span className="groupe-venus">{venus} / {enfants.length} venus</span>
      </header>
      <p className="jeux">{jeux.length ? jeux.join(' · ') : '—'}</p>
      {enfants.length === 0 ? (
        <p className="vide">Aucun enfant dans ce groupe.</p>
      ) : (
        <div className="table-defile">
          <table className="tableau appels">
            <thead>
              <tr><th>Parent</th><th>Téléphone</th><th>Langue</th><th>Enfant</th><th>Âge</th><th>Appelé</th><th>A confirmé</th><th>Est venu</th></tr>
            </thead>
            <tbody>
              {enfants.map((e) => {
                const pr = p(e.id);
                return (
                  <tr key={e.id}>
                    <td data-titre="Parent">{e.parentNom}</td>
                    <td data-titre="Téléphone">
                      <a href={`tel:${e.parentTelephone.replace(/\s/g, '')}`}>{e.parentTelephone}</a>
                      {pr?.invite && <span className="badge-sms">SMS envoyé</span>}
                    </td>
                    <td data-titre="Langue">{e.langue}</td>
                    <td data-titre="Enfant">
                      <strong>{e.prenom}</strong>
                      {Date.now() - new Date(e.dateEnregistrement).getTime() < 30 * 86400000 && <span className="badge-nouveau">Nouveau</span>}
                      {estPrescolaire(e.dateNaissance, dateRef) && <span className="alerte-presco">À orienter vers le préscolaire</span>}
                    </td>
                    <td data-titre="Âge">{texteAge(e.dateNaissance, dateRef)}</td>
                    {(['appele', 'confirme', 'venu'] as const).map((champ) => (
                      <td key={champ} data-titre={champ === 'appele' ? 'Appelé' : champ === 'confirme' ? 'A confirmé' : 'Est venu'} className="case">
                        <input
                          type="checkbox"
                          checked={!!pr?.[champ]}
                          onChange={(ev) => onChange(e.id, champ, ev.target.checked)}
                          aria-label={`${champ} — ${e.prenom}`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
