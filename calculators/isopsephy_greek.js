/**
 * Calculadora de Isopsefia Grega
 *
 * Sistema clássico grego atribuído a vezos áticos:
 *   α=1, β=2, γ=3, δ=4, ε=5, ϛ(digamma stigma)=6, ζ=7, η=8, θ=9,
 *   ι=10, κ=20, λ=30, μ=40, ν=50, ξ=60, ο=70, π=80, ϙ(qoppa)=90,
 *   ρ=100, σ=200, τ=300, υ=400, φ=500, χ=600, ψ=700, ω=800, ϡ(sampi)=900.
 *
 * Inclui letras obsoletas (digamma/stigma, qoppa, sampi) por sua importância
 * histórica em inscrições antigas e no cómputo isopsefista primitivo.
 *
 * Suporta letras maiúsculas, minúsculas e acentuadas; remove sinais
 * diacríticos gregos (U+0300..U+036F e perispomeni/oxia etc.).
 */

const GREEK_MAP = {
  // Minúsculas
  "α": 1, "β": 2, "γ": 3, "δ": 4, "ε": 5,
  "ϛ": 6, "ζ": 7, "η": 8, "θ": 9,
  "ι": 10, "κ": 20, "λ": 30, "μ": 40, "ν": 50,
  "ξ": 60, "ο": 70, "π": 80, "ϙ": 90,
  "ρ": 100, "σ": 200, "ς": 200, "τ": 300, "υ": 400,
  "φ": 500, "χ": 600, "ψ": 700, "ω": 800, "ϡ": 900,

  // Maiúsculas
  "Α": 1, "Β": 2, "Γ": 3, "Δ": 4, "Ε": 5,
  "Ϛ": 6, "Ζ": 7, "Η": 8, "Θ": 9,
  "Ι": 10, "Κ": 20, "Λ": 30, "Μ": 40, "Ν": 50,
  "Ξ": 60, "Ο": 70, "Π": 80, "Ϙ": 90,
  "Ρ": 100, "Σ": 200, "Τ": 300, "Υ": 400,
  "Φ": 500, "Χ": 600, "Ψ": 700, "Ω": 800, "Ϡ": 900,
};

// Combina diacríticos gregos e marcas combinantes Unicode.
const COMBINING_DIACRITICS = /\p{M}/gu;

export default function isopsephy_greek(text) {
  const cleaned = text.replace(COMBINING_DIACRITICS, "");

  const details = [];

  for (const char of cleaned) {
    const value = GREEK_MAP[char] ?? 0;
    details.push({ char, value });
  }

  const total = details.reduce((acc, item) => acc + item.value, 0);

  return { total, details };
}