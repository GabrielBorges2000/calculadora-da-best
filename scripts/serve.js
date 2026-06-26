/**
 * Servidor estático zero-dependências para rodar a interface web.
 *
 * Uso:
 *   pnpm web            # porta padrão 8080
 *   PORT=3000 pnpm web  # porta customizada
 *
 * Por que existe: o Chrome bloqueia dynamic import de arquivos locais
 * (file://) por política de CORS. Servir via http://localhost resolve isso
 * em qualquer navegador sem adicionar dependências.
 */

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 3000;

// MIME types básicos. Sem isso, .js vira download em vez de script.
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

function safeJoin(root, urlPath) {
  // Decodifica e neutraliza path traversal ("../", etc.).
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const resolved = path.normalize(path.join(root, decoded));
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = safeJoin(ROOT, urlPath);

    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const s = await stat(filePath).catch(() => null);
    if (!s || !s.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 — não encontrado: " + urlPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] ?? "application/octet-stream";
    const body = await readFile(filePath);

    res.writeHead(200, {
      "Content-Type": mime,
      "Content-Length": body.length,
      // Importante: permite que o HTML faça dynamic import dos calculators/*.js
      // quando servido via http://localhost (não é mais file://).
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("500 — erro interno: " + String(err));
  }
});

server.listen(PORT, () => {
  console.log(`✔ Servidor estático rodando em http://localhost:${PORT}`);
  console.log(`  Servindo: ${ROOT}`);
  console.log(`  Abra http://localhost:${PORT} no navegador.`);
});