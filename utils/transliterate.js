/**
 * Transliterator de latim → hebraico / grego (aproximado)
 *
 * Não há mapeamento 1:1 perfeito entre o alfabeto latino e os alfabetos
 * hebraico/grego, porque eles não compartilham as mesmas categorias
 * fonéticas. Esta implementação adota uma convenção acadêmica simples
 * (semelhante à usada em textos acadêmicos de ocultismo e estudos
 * esotéricos) baseada em sons aproximados.
 *
 * Letras sem equivalente (ex.: 'Q' antes de 'U' em hebraico) recebem o
 * som consonantal mais próximo. Vogais latinas são convertidas em vogais
 * gregas; em hebraico, viram as vogais longas alef/ayin/vav/yod ou são
 * apenas ignoradas conforme o contexto.
 *
 * NOTA: este utilitário é OPCIONAL e aproximado. O sistema principal
 * funciona diretamente com texto latino nas calculadoras padrão.
 */

// ------------------------- Latim → Hebraico -------------------------

const LATIN_TO_HEBREW = {
  // Consoantes com equivalência direta ou aproximada
  A: "א", B: "ב", C: "כ", D: "ד", E: "א",
  F: "פ", G: "ג", H: "ח", I: "י", J: "י",
  K: "כ", L: "ל", M: "מ", N: "נ", O: "ו",
  P: "פ", Q: "ק", R: "ר", S: "ס", T: "ת",
  U: "ו", V: "ו", W: "ו", X: "כס", Y: "י", Z: "ז",
  // Casos especiais em início de palavra
};

// ------------------------- Latim → Grego -------------------------

const LATIN_TO_GREEK = {
  A: "α", B: "β", C: "κ", D: "δ", E: "ε",
  F: "φ", G: "γ", H: "χ", I: "ι", J: "ι",
  K: "κ", L: "λ", M: "μ", N: "ν", O: "ο",
  P: "π", Q: "κ", R: "ρ", S: "σ", T: "τ",
  U: "υ", V: "β", W: "ω", X: "ξ", Y: "υ",
  Z: "ζ",
};

/**
 * Translitera um texto em latim para hebraico aproximado.
 * Letras não-mapeadas são puladas.
 */
export function latinToHebrew(text) {
  const upper = text.toUpperCase();
  let result = "";

  for (const ch of upper) {
    const mapped = LATIN_TO_HEBREW[ch];
    if (mapped) result += mapped;
  }

  return result;
}

/**
 * Translitera um texto em latim para grego aproximado.
 * Letras não-mapeadas são puladas.
 */
export function latinToGreek(text) {
  const upper = text.toUpperCase();
  let result = "";

  for (const ch of upper) {
    const mapped = LATIN_TO_GREEK[ch];
    if (mapped) result += mapped;
  }

  return result;
}

/**
 * Transliterator genérico que retorna ambos os resultados.
 */
export function transliterate(text) {
  return {
    hebrew: latinToHebrew(text),
    greek: latinToGreek(text),
  };
}