/**
 * Calculadora Unicode
 * Soma os code points Unicode completos (não apenas UTF-16).
 * Funciona para caracteres básicos (BMP) e para emojis/símbolos
 * fora do BMP usando `codePointAt` em vez de `charCodeAt`.
 */
export default function unicode(text) {
  const details = [];

  // `for...of` itera por code points, não por unidades UTF-16.
  for (const char of text) {
    details.push({ char, value: char.codePointAt(0) });
  }

  const total = details.reduce((acc, item) => acc + item.value, 0);

  return { total, details };
}
