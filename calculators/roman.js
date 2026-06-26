/**
 * Calculadora Roman Numerals
 * Atribui os valores clássicos dos numerais romanos:
 *   I=1, V=5, X=10, L=50, C=100, D=500, M=1000
 * Apenas caracteres romanos válidos geram valor; o resto é ignorado (0).
 *
 * Observação: aqui somamos cada símbolo diretamente (sem aplicar a regra
 * subtrativa IV=4, IX=9 etc.), pois o objetivo é atribuir um "peso"
 * simbólico a cada letra, não converter números romanos em arábicos.
 */
export default function roman(text) {
  const map = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  const upper = text.toUpperCase();
  const details = [];

  for (const char of upper) {
    details.push({ char, value: map[char] ?? 0 });
  }

  const total = details.reduce((acc, item) => acc + item.value, 0);

  return { total, details };
}
