/**
 * Utilitário de normalização de texto
 *
 * - `stripAccents`: remove diacríticos de letras latinas usando NFD + filtro
 *   da categoria Unicode "Mark" (Mn). Ex.: "é" → "e", "ção" → "cao".
 * - `upperLatin`: coloca o texto em maiúsculas, removendo acentos.
 */

export function stripAccents(text) {
  return text.normalize("NFD").replace(/\p{M}/gu, "");
}

export function upperLatin(text) {
  return stripAccents(text).toUpperCase();
}