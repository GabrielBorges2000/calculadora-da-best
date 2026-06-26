/**
 * Calculadora ASCII
 * Soma os códigos ASCII (charCodeAt) de cada caractere do texto.
 * Funciona com qualquer caractere imprimível e usa o índice UTF-16.
 */
export default function ascii(text) {
  const details = [];

  for (const char of text) {
    details.push({ char, value: char.charCodeAt(0) });
  }

  const total = details.reduce((acc, item) => acc + item.value, 0);

  return { total, details };
}
