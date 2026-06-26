/**
 * Calculadora Alphabet (A=1, B=2 ... Z=26)
 * Converte apenas letras latinas A-Z (ignorando acentos e demais caracteres).
 * Regra: A=1, B=2, ..., Z=26 — método clássico pitagórico/ocidental.
 */
export default function alphabet(text) {
  const details = [];
  const upper = text.toUpperCase();

  for (const char of upper) {
    const code = char.charCodeAt(0);
    // 65 = 'A' → 1 ; 90 = 'Z' → 26
    if (code >= 65 && code <= 90) {
      details.push({ char, value: code - 64 });
    }
    // Demais caracteres (espaços, números, pontuação) recebem 0.
    else {
      details.push({ char, value: 0 });
    }
  }

  const total = details.reduce((acc, item) => acc + item.value, 0);

  return { total, details };
}
