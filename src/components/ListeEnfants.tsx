import { useMemo, useState } from 'react';
import type { Store } from '../store/useStore';
import { estPrescolaire, texteAge } from '../utils/age';
import Filtres from './Filtres';
import ConfirmationModal from './ConfirmationModal';

/** Liste des enfants enregistrés, avec recherche et filtres */
export default function ListeEnfants({ store, prescolaire = false, villeFixe }: { store: Store; prescolaire?: boolean; villeFixe?: string }) {
  const { enfants, regions, localites, quartiers } = store.donnees;
  const [regionId, setRegionId] = useState('');
  const [recherche, setRecherche] = useState('');
  const [localiteId, setLocaliteId] = useState('');
  const [quartierId, setQuartierId] = useState('');
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const maintenant = new Date();

  const nomQuartier = (id: string) => quartiers.find((q) => q.id === id)?.nom ?? '?';
  const nomLocalite = (id: string) => localites.find((l) => l.id === id)?.nom ?? '?';

  const liste = useMemo(() => {
    const t = recherche.trim().toLowerCase();
    return enfants
      .filter((e) => !villeFixe || e.localiteId === villeFixe)
      .filter((e) => !prescolaire || estPrescolaire(e.dateNaissance, new Date()))
      .filter((e) => !regionId || localites.find((l) => l.id === e.localiteId)?.regionId === regionId)
      .filter((e) => !localiteId || e.localiteId === localiteId)
      .filter((e) => !quartierId || e.quartierId === quartierId)
      .filter((e) => !t || `${e.prenom} ${e.nom} ${e.parentNom} ${e.parentTelephone}`.toLowerCase().includes(t))
      .sort((a, b) => b.dateNaissance.localeCompare(a.dateNaissance));
  }, [enfants, villeFixe, prescolaire, localites, recherche, regionId, localiteId, quartierId]);

  const enfantASupprimer = enfants.find((e) => e.id === aSupprimer);

  return (
    <section className="carte">
      <h2>{prescolaire ? 'À orienter vers le préscolaire' : 'Enfants enregistrés'} <span className="compteur">{liste.length} / {enfants.length}</span></h2>
      <Filtres
        regions={regions} regionId={regionId} onRegion={setRegionId}
        localites={localites} quartiers={quartiers}
        localiteId={localiteId} quartierId={quartierId}
        onLocalite={setLocaliteId} onQuartier={setQuartierId}
        recherche={recherche} onRecherche={setRecherche} masquerLieu={!!villeFixe}
      />
      {liste.length === 0 ? (
        <p className="vide">Aucun enfant pour le moment. Enregistrez une naissance ou chargez les données de démonstration.</p>
      ) : (
        <div className="table-defile">
          <table className="tableau">
            <thead>
              <tr><th>Enfant</th><th>Âge</th><th>Parent</th><th>Téléphone</th><th>Langue</th><th>Lieu</th><th></th></tr>
            </thead>
            <tbody>
              {liste.map((e) => (
                <tr key={e.id}>
                  <td data-titre="Enfant"><strong>{e.prenom} {e.nom}</strong> <span className={`sexe sexe-${e.sexe}`}>{e.sexe === 'F' ? 'F' : 'G'}</span></td>
                  <td data-titre="Âge">{texteAge(e.dateNaissance, maintenant)}</td>
                  <td data-titre="Parent">{e.parentNom}</td>
                  <td data-titre="Téléphone"><a href={`tel:${e.parentTelephone.replace(/\s/g, '')}`}>{e.parentTelephone}</a></td>
                  <td data-titre="Langue">{e.langue}</td>
                  <td data-titre="Lieu">{nomQuartier(e.quartierId)}, {nomLocalite(e.localiteId)}</td>
                  <td><button className="btn-lien" onClick={() => setASupprimer(e.id)} aria-label={`Supprimer ${e.prenom}`}>Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        ouvert={!!enfantASupprimer}
        titre="Supprimer cet enfant ?"
        message={enfantASupprimer ? `${enfantASupprimer.prenom} ${enfantASupprimer.nom} sera retiré(e) de la liste.` : ''}
        libelleConfirmer="Supprimer"
        danger
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => { if (aSupprimer) store.supprimerEnfant(aSupprimer); setASupprimer(null); }}
      />
    </section>
  );
}
