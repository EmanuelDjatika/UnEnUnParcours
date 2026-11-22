# Un enfant, un parcours d'éveil

*De la naissance au préscolaire, par le jeu* — prototype pour le hackathon UNICEF Togo.

La mairie enregistre chaque naissance (avec l'accord du parent). Les enfants sont classés par âge et par quartier. Chaque crèche reçoit la liste des familles à inviter aux ateliers de fabrication de jeux adaptés à l'âge de leur enfant.

## Lancer le projet

Il faut [Node.js](https://nodejs.org) (version 20 ou plus).

```bash
cd un-enfant-un-parcours-eveil
npm install
npm run dev
```

Ouvrez ensuite l'adresse affichée (en général http://localhost:5173).

Pour une version à déposer sur un serveur ou une clé USB : `npm run build`, puis `npm run preview` pour la tester. Le résultat est dans `dist/`.

## Fonctionnement

- **Pas de serveur** : tout est enregistré dans le navigateur (localStorage). L'app marche hors ligne.
- **Tranches d'âge** : 0-1 an à 4-5 ans, calculées au 15 du mois de l'atelier.
- **Préscolaire** : un enfant de 3 ans ou plus est signalé « À orienter vers le préscolaire ».

## Démo en 3 minutes

1. Au premier lancement (liste vide), 60 enfants fictifs sont chargés automatiquement (Lomé et Kara, numéros +228 90 00 00 xx).
2. **Mairie** : enregistrez une naissance. Le bouton reste bloqué tant que la case d'accord du parent n'est pas cochée. Le quartier dépend de la localité ; on peut en ajouter un. Montrez la recherche et les filtres sous le formulaire.
3. **Crèches et ateliers** : choisissez Lomé, puis « Crèche Les Petits Pas », puis le mois. Les enfants sont regroupés par âge, avec le jeu à fabriquer. Cochez « appelé », « a confirmé », « est venu ». Montrez **Imprimer la liste** (A4) et **Exporter en CSV**. Choisissez le mois précédent pour voir des présences déjà cochées. Ouvrez « Réglages des jeux » pour modifier un atelier.
4. **Tableau de bord** : enfants par localité, quartier, tranche d'âge et sexe ; participation par crèche ; nombre d'enfants à orienter vers le préscolaire.

## Structure

```
src/
  App.tsx, main.tsx          onglets et barre de données
  types.ts                   types partagés
  data/demo.ts               données de démonstration
  data/ateliers.ts           jeux par tranche d'âge
  store/useStore.ts          état global + sauvegarde localStorage
  utils/age.ts               âge et tranche à une date donnée
  utils/export.ts            CSV, JSON, impression
  pages/                     Mairie, Crèches, Tableau de bord
  components/                formulaire, listes, filtres, graphique SVG, confirmation
  styles/global.css          couleurs, mise en page, impression A4
```

## Les trois espaces et les comptes de démonstration

Chaque espace a sa page de connexion, avec les identifiants préremplis (prototype) : `/admin/connexion`, `/mairie/connexion`, `/creche/connexion`. La racine `/` propose de choisir l'espace.

| Espace | Adresse | Identifiant | Mot de passe | Ce qu'on y voit |
|---|---|---|---|---|
| Administration | `/admin` | `admin` | `admin2026` | Tout : toutes les régions, villes, crèches |
| Mairie de Lomé | `/mairie` | `mairie-lome` | `lome2026` | Sa ville : tableau de bord, enregistrement, liste des enfants |
| Mairie de Kara | `/mairie` | `mairie-kara` | `kara2026` | Idem pour Kara |
| Crèches | `/creche` | `creche-petits-pas`, `creche-soleil`, `creche-espoir`, `creche-arc-en-ciel` | `creche2026` | Sa crèche : tableau de bord et listes d'appels |

⚠️ Prototype sans serveur : les comptes sont dans le code (`src/data/comptes.ts`) et les données restent sur l'appareil. Ce n'est pas une vraie sécurité ; en production, il faut un serveur d'authentification et une base de données partagée.
