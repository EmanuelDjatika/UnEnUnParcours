import type { TrancheId } from '../types';

export const TRANCHES: TrancheId[] = [0, 1, 2, 3, 4];

/** Libellé d'une tranche : « 0-1 an », « 1-2 ans »… */
export function libelleTranche(t: TrancheId): string {
  return t === 0 ? '0-1 an' : `${t}-${t + 1} ans`;
}

/** Âge à partir duquel l'enfant est orienté vers le préscolaire */
export const AGE_PRESCOLAIRE = 3;

/** Convertit « AAAA-MM-JJ » en Date locale (évite les décalages de fuseau) */
export function versDate(iso: string): Date {
  const [a, m, j] = iso.slice(0, 10).split('-').map(Number);
  return new Date(a, (m || 1) - 1, j || 1);
}

/** Âge en mois révolus à une date de référence */
export function ageEnMois(dateNaissance: string, ref: Date): number {
  const n = versDate(dateNaissance);
  let mois = (ref.getFullYear() - n.getFullYear()) * 12 + (ref.getMonth() - n.getMonth());
  if (ref.getDate() < n.getDate()) mois -= 1;
  return mois;
}

/** Âge en années révolues */
export function ageEnAnnees(dateNaissance: string, ref: Date): number {
  return Math.floor(ageEnMois(dateNaissance, ref) / 12);
}

/** Tranche d'âge d'un an à la date donnée, ou null si hors 0-5 ans */
export function trancheA(dateNaissance: string, ref: Date): TrancheId | null {
  const mois = ageEnMois(dateNaissance, ref);
  if (mois < 0) return null;
  const ans = Math.floor(mois / 12);
  return ans <= 4 ? (ans as TrancheId) : null;
}

/** Texte lisible : « 8 mois », « 2 ans et 3 mois » */
export function texteAge(dateNaissance: string, ref: Date): string {
  const mois = ageEnMois(dateNaissance, ref);
  if (mois < 0) return 'pas encore né';
  if (mois < 12) return `${mois} mois`;
  const a = Math.floor(mois / 12);
  const r = mois % 12;
  const base = `${a} an${a > 1 ? 's' : ''}`;
  return r ? `${base} et ${r} mois` : base;
}

/** L'enfant a-t-il atteint l'âge du préscolaire à cette date ? */
export function estPrescolaire(dateNaissance: string, ref: Date): boolean {
  return ageEnMois(dateNaissance, ref) >= AGE_PRESCOLAIRE * 12;
}

/** Date de l'atelier pour un mois « AAAA-MM » : on prend le 15 du mois */
export function dateAtelier(mois: string): Date {
  const [a, m] = mois.split('-').map(Number);
  return new Date(a, m - 1, 15);
}

/** Mois courant au format « AAAA-MM » */
export function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Date du jour au format « AAAA-MM-JJ » */
export function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Libellé de mois en français : « novembre 2026 » */
export function libelleMois(mois: string): string {
  return dateAtelier(mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}
