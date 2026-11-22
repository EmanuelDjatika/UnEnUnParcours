// Outils d'export : CSV, JSON et impression

/** Déclenche le téléchargement d'un fichier dans le navigateur */
export function telecharger(nomFichier: string, contenu: string, type: string): void {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Échappe une cellule CSV (séparateur point-virgule, lisible par Excel en français) */
function cellule(v: string | number | boolean): string {
  const s = typeof v === 'boolean' ? (v ? 'oui' : 'non') : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Construit un CSV à partir d'un en-tête et de lignes */
export function versCSV(entete: string[], lignes: (string | number | boolean)[][]): string {
  const tout = [entete, ...lignes].map((l) => l.map(cellule).join(';'));
  // BOM UTF-8 pour que les accents s'affichent bien dans Excel
  return '﻿' + tout.join('\r\n');
}

export function exporterCSV(nomFichier: string, entete: string[], lignes: (string | number | boolean)[][]): void {
  telecharger(nomFichier, versCSV(entete, lignes), 'text/csv;charset=utf-8');
}

export function exporterJSON(nomFichier: string, donnees: unknown): void {
  telecharger(nomFichier, JSON.stringify(donnees, null, 2), 'application/json');
}

/** Lit un fichier JSON choisi par l'utilisateur */
export function lireFichierJSON(fichier: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        resolve(JSON.parse(String(r.result)));
      } catch (e) {
        reject(e);
      }
    };
    r.onerror = () => reject(r.error);
    r.readAsText(fichier);
  });
}

/** Ouvre la boîte d'impression (la mise en page A4 est dans le CSS @media print) */
export function imprimer(): void {
  window.print();
}
