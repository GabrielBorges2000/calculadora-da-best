/**
 * Calculadora de Gematria Hebraica
 *
 * Tabela tradicional das 22 letras hebraicas + 5 formas finais (Sofitot),
 * resultando em 27 valores distintos. Valores em hebraico clássico:
 *
 *   א (Alef)    = 1     נ (Nun)       = 50
 *   ב (Bet)     = 2     ס (Samekh)    = 60
 *   ג (Gimel)   = 3     ע (Ayin)      = 70
 *   ד (Dalet)   = 4     פ (Pe)        = 80
 *   ה (He)      = 5     צ (Tsade)     = 90
 *   ו (Vav)     = 6     ק (Qof)       = 100
 *   ז (Zayin)   = 7     ר (Resh)      = 200
 *   ח (Het)     = 8     ש (Shin)      = 300
 *   ט (Tet)     = 9     ת (Tav)       = 400
 *   י (Yod)     = 10
 *   כ (Kaf)     = 20    Formas finais (Sofitot):
 *   ל (Lamed)   = 30    ך (Kaf final)  = 500
 *   מ (Mem)     = 40    ם (Mem final)  = 600
 *                       ן (Nun final)  = 700
 *                       ף (Pe final)   = 800
 *                       ץ (Tsade final)= 900
 *
 * Letras com niqqud (vogais) são tratadas removendo-se os sinais vocálicos.
 * Caracteres não-hebraicos recebem 0.
 */

const HEBREW_MAP = {
  // Letras regulares
  "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5,
  "ו": 6, "ז": 7, "ח": 8, "ט": 9, "י": 10,
  "כ": 20, "ל": 30, "מ": 40, "נ": 50, "ס": 60,
  "ע": 70, "פ": 80, "צ": 90, "ק": 100, "ר": 200,
  "ש": 300, "ת": 400,

  // Letras finais (Sofitot) — valores próprios
  "ך": 500, "ם": 600, "ן": 700, "ף": 800, "ץ": 900,
};

// Niqqud e marcas cantiladas (U+0591..U+05C7) — removidos antes do cálculo.
const NIQUD_REGEX = /[֑-ׇ]/g;

export default function gematria_hebrew(text) {
  // Mantém apenas letras hebraicas, removendo sinais diacríticos.
  const cleaned = text.replace(NIQUD_REGEX, "");

  const details = [];

  for (const char of cleaned) {
    const value = HEBREW_MAP[char] ?? 0;
    details.push({ char, value });
  }

  const total = details.reduce((acc, item) => acc + item.value, 0);

  return { total, details };
}