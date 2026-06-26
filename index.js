/**
 * Apocalypse 666 — sistema modular de cálculo numerológico de textos.
 *
 * Cada arquivo em /calculators é um "plugin": exporta uma função default
 * que recebe um texto e devolve { total, details: [{ char, value }] }.
 *
 * O sistema descobre os plugins lendo o diretório em tempo de execução,
 * via fs.readdir, e os importa dinamicamente. Para adicionar um novo
 * método, basta criar calculators/<nome>.js exportando `default`.
 *
 * Uso programático:
 *   import { calculate } from "./index.js";
 *   calculate("Neron Caesar");
 *
 * Uso via CLI (`pnpm dev`):
 *   Lê cada linha de names.txt, calcula todos os métodos e imprime
 *   uma tabela no console, salvando em temp/resul-<YYYYMMDD-HHMMSS>/ com
 *   um .md por nome (kebab-case) e um INDEX.md geral.
 */

import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ---------------------- Configuração de paths -----------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CALCULATORS_DIR = path.join(__dirname, "calculators");
const UTILS_DIR = path.join(__dirname, "utils");
const NAMES_FILE = path.join(__dirname, "names.txt");
const TEMP_DIR = path.join(__dirname, "temp");

// ---------------------- Loader de plugins ----------------------------

/**
 * Lê todos os arquivos .js dentro do diretório de calculadoras e os
 * importa como módulos ESM. Retorna um mapa { nomeDoArquivo: funcao }.
 *
 * O nome do plugin é derivado do nome do arquivo sem extensão:
 *   calculators/ascii.js        → "ascii"
 *   calculators/gematria_hebrew.js → "gematria_hebrew"
 */
async function loadCalculators() {
  const entries = await fsp.readdir(CALCULATORS_DIR, { withFileTypes: true });
  const plugins = {};

  for (const entry of entries) {
    // Ignora subdiretórios e arquivos que não sejam .js
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const name = path.basename(entry.name, ".js");
    const fullPath = path.join(CALCULATORS_DIR, entry.name);
    const moduleUrl = pathToFileURL(fullPath).href;

    // Import dinâmico respeitando ESM
    const mod = await import(moduleUrl);
    const fn = mod.default ?? mod.defaultExport ?? mod;

    if (typeof fn !== "function") {
      console.warn(
        `[aviso] ${entry.name} não exporta uma função default — ignorando.`,
      );
      continue;
    }

    plugins[name] = fn;
  }

  return plugins;
}

// ---------------------- Função principal ----------------------------

const plugins = await loadCalculators();

/**
 * Aplica todos os plugins carregados ao texto fornecido.
 * @param {string} text
 * @returns {Object} mapa { <nome-do-plugin>: { total, details } }
 */
export function calculate(text) {
  const result = {};

  for (const [name, fn] of Object.entries(plugins)) {
    try {
      result[name] = fn(text);
    } catch (err) {
      result[name] = { total: 0, details: [], error: String(err) };
    }
  }

  return result;
}

/**
 * Lê um arquivo linha-a-linha, ignorando linhas vazias e comentários
 * iniciados por '#'.
 */
async function readNames(filePath) {
  const raw = await fsp.readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

// ---------------------- Renderização --------------------------------

/**
 * Constrói uma tabela resumo (uma linha por plugin) para visão geral.
 */
function renderSummaryTable(text, result) {
  const summary = { name: text };
  for (const [pluginName, data] of Object.entries(result)) {
    summary[pluginName] = data.total;
  }
  return summary;
}

// ---------------------- Persistência em /temp -----------------------

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Timestamp completo para nomear a pasta de saída.
 * Formato: YYYYMMDD-HHMMSS (data + horário).
 * Ex.: "20260625-211331"
 */
function currentTimestamp() {
  const d = new Date();
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

async function ensureTempDir() {
  await fsp.mkdir(TEMP_DIR, { recursive: true });
}

/**
 * Converte um nome em slug kebab-case ASCII.
 *   "Neron Caesar"        → "neron-caesar"
 *   "Vicarius Filii Dei"  → "vicarius-filii-dei"
 *   "Papa"                → "papa"
 *
 * Estratégia:
 *  1. Normaliza (NFD) e remove diacríticos (ex.: "ção" → "cao").
 *  2. Substitui tudo que não for [a-z0-9] por "-".
 *  3. Colapsa hífens repetidos e corta nas pontas.
 *  4. Limita a 80 chars para evitar nomes de arquivo absurdos.
 */
function toKebabCase(text) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")     // remove diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // não-alfanumérico → hífen
    .replace(/^-+|-+$/g, "")    // corta hífens nas pontas
    .slice(0, 80) || "unnamed"; // fallback se string vazia
}

/**
 * Garante que cada slug é único dentro da pasta, anexando "-2", "-3", etc.
 */
function uniqueSlug(slug, used) {
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let i = 2;
  while (used.has(`${slug}-${i}`)) i++;
  const unique = `${slug}-${i}`;
  used.add(unique);
  return unique;
}

/**
 * Renderiza o conteúdo markdown completo de UM nome.
 */
function renderNameMarkdown(name, result) {
  const lines = [];
  lines.push(`# ${name}`);
  lines.push("");
  lines.push(`> Gerado em ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## Resultados`);
  lines.push("");

  // Tabela-resumo em markdown (uma coluna por método).
  lines.push(`| Método | Total |`);
  lines.push(`| --- | ---: |`);
  for (const [pluginName, data] of Object.entries(result)) {
    lines.push(`| ${pluginName} | ${data.total} |`);
  }
  lines.push("");

  // Detalhamento por método.
  for (const [pluginName, data] of Object.entries(result)) {
    lines.push(`## ${pluginName}`);
    lines.push("");
    lines.push(`**Total:** ${data.total}`);
    lines.push("");
    lines.push(`| Caractere | Valor |`);
    lines.push(`| --- | ---: |`);
    for (const item of data.details) {
      const display =
        item.char === " " ? "`(espaço)`"
        : item.char === "\n" ? "`\\n`"
        : item.char === "\t" ? "`\\t`"
        : `\`${item.char}\``;
      lines.push(`| ${display} | ${item.value} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Cria a pasta temp/resul-<HHMMSS>/ e grava um .md por nome.
 * Retorna o caminho da pasta criada.
 */
async function saveReports(summaryRows) {
  await ensureTempDir();
  const folderName = `resul-${currentTimestamp()}`;
  const folderPath = path.join(TEMP_DIR, folderName);
  await fsp.mkdir(folderPath, { recursive: true });

  const usedSlugs = new Set();

  for (const row of summaryRows) {
    const baseSlug = toKebabCase(row.name);
    const slug = uniqueSlug(baseSlug, usedSlugs);
    const result = calculate(row.name);
    const md = renderNameMarkdown(row.name, result);
    const filePath = path.join(folderPath, `${slug}.md`);
    await fsp.writeFile(filePath, md, "utf8");
  }

  // INDEX.md — visão geral da execução.
  const indexLines = [];
  indexLines.push(`# Apocalypse 666 — execução ${folderName}`);
  indexLines.push("");
  indexLines.push(`> Gerado em ${new Date().toISOString()}`);
  indexLines.push("");
  indexLines.push(`## Resumo`);
  indexLines.push("");
  indexLines.push(`| Nome | ${Object.keys(plugins).join(" | ")} |`);
  indexLines.push(`| --- | ${Object.keys(plugins).map(() => "---:").join(" | ")} |`);
  for (const row of summaryRows) {
    indexLines.push(
      `| [${row.name}](./${toKebabCase(row.name)}.md) | ` +
        Object.keys(plugins).map((p) => row[p]).join(" | ") +
        ` |`,
    );
  }
  indexLines.push("");
  await fsp.writeFile(path.join(folderPath, "INDEX.md"), indexLines.join("\n"), "utf8");

  return folderPath;
}

// ---------------------- Execução principal --------------------------

async function main() {
  // Garante que /temp exista desde o início.
  await ensureTempDir();

  const names = await readNames(NAMES_FILE);

  if (names.length === 0) {
    console.warn(
      "Nenhum nome encontrado em names.txt. Adicione um nome por linha.",
    );
    return;
  }

  const summaryRows = [];

  for (const name of names) {
    summaryRows.push(renderSummaryTable(name, calculate(name)));
  }

  // Console: imprime APENAS a tabela final consolidada (uma linha por nome).
  console.log("");
  console.log("=".repeat(60));
  console.log(`Apocalypse 666 — ${names.length} nome(s), ${Object.keys(plugins).length} método(s)`);
  console.log("=".repeat(60));
  console.table(summaryRows);
  console.log("");

  const folderPath = await saveReports(summaryRows);
  console.log(`✔ Salvo em: ${path.relative(__dirname, folderPath)}/`);
  console.log(`  ${summaryRows.length} arquivo(s) .md + INDEX.md`);
}

// CLI: executa apenas se chamado diretamente (não em `import`).
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (invokedDirectly) {
  main().catch((err) => {
    console.error("Erro fatal:", err);
    process.exitCode = 1;
  });
}