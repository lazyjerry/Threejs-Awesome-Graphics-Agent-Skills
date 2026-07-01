#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { discoverExamples } from "./discovery.mjs";

const galleryRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(galleryRoot, "../..");
const publicRoot = path.join(galleryRoot, "public");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".glb", "model/gltf-binary"],
  [".gltf", "model/gltf+json"],
  [".hdr", "image/vnd.radiance"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".ktx2", "image/ktx2"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ts", "text/javascript; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".wgsl", "text/plain; charset=utf-8"],
]);

function parseArgs(argv) {
  const options = {
    host: "127.0.0.1",
    port: 4173,
    open: false,
    includeFixtures: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--host" && argv[index + 1]) {
      options.host = argv[index + 1];
      index += 1;
    } else if (argument === "--port" && argv[index + 1]) {
      options.port = Number.parseInt(argv[index + 1], 10);
      index += 1;
    } else if (argument === "--open") {
      options.open = true;
    } else if (argument === "--include-fixtures") {
      options.includeFixtures = true;
    } else if (argument === "--help" || argument === "-h") {
      console.log(`Three.js example gallery

Usage:
  node dev/example-gallery/server.mjs [options]

Options:
  --host <host>          Bind host (default: 127.0.0.1)
  --port <port>          Bind port; use 0 for any free port (default: 4173)
  --open                 Open the gallery in the system browser
  --include-fixtures     Include gallery self-test fixtures
`);
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete option: ${argument}`);
    }
  }

  if (!Number.isInteger(options.port) || options.port < 0 || options.port > 65535) {
    throw new Error("--port must be an integer from 0 to 65535.");
  }
  return options;
}

async function existingFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function safePath(root, pathname) {
  const target = path.resolve(root, `.${pathname}`);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return target;
}

async function sendFile(request, response, filePath) {
  if (!(await existingFile(filePath))) return false;
  const metadata = await stat(filePath);
  response.writeHead(200, {
    "content-type":
      contentTypes.get(path.extname(filePath).toLowerCase()) ??
      "application/octet-stream",
    "content-length": metadata.size,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  if (request.method === "HEAD") {
    response.end();
  } else {
    createReadStream(filePath).pipe(response);
  }
  return true;
}

async function resolveServableFile(root, pathname) {
  const target = safePath(root, pathname);
  if (!target) return null;
  if (await existingFile(target)) return target;
  if (path.extname(target) !== "") return null;

  for (const extension of [".ts", ".js", ".glsl", ".frag", ".vert"]) {
    const candidate = `${target}${extension}`;
    if (await existingFile(candidate)) return candidate;
  }
  return null;
}

async function sendRawModule(request, response, filePath) {
  const source = await readFile(filePath, "utf8");
  const payload = `export default ${JSON.stringify(source)};\n`;
  response.writeHead(200, {
    "content-type": "text/javascript; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(request.method === "HEAD" ? undefined : payload);
  return true;
}

async function sendTypeScriptModule(request, response, filePath) {
  const source = await readFile(filePath, "utf8");
  const result = await transform(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
    legalComments: "none",
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  });
  response.writeHead(200, {
    "content-type": "text/javascript; charset=utf-8",
    "content-length": Buffer.byteLength(result.code),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(request.method === "HEAD" ? undefined : result.code);
  return true;
}

async function sendProjectModule(request, response, root, pathname, raw) {
  const filePath = await resolveServableFile(root, pathname);
  if (!filePath) return false;
  if (raw) return sendRawModule(request, response, filePath);
  if (path.extname(filePath) === ".ts") {
    return sendTypeScriptModule(request, response, filePath);
  }
  return sendFile(request, response, filePath);
}

export function createExampleGalleryServer({ includeFixtures = false } = {}) {
  return createServer(async (request, response) => {
    try {
      if (!["GET", "HEAD"].includes(request.method ?? "")) {
        response.writeHead(405, { allow: "GET, HEAD" }).end("Method not allowed");
        return;
      }

      const url = new URL(request.url ?? "/", "http://localhost");
      const rawModule = url.search === "?raw" || url.searchParams.has("raw");
      if (url.pathname === "/api/examples") {
        const examples = await discoverExamples(projectRoot, { includeFixtures });
        const payload = JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            count: examples.length,
            examples,
          },
          null,
          2,
        );
        response.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
          "content-length": Buffer.byteLength(payload),
        });
        response.end(request.method === "HEAD" ? undefined : payload);
        return;
      }

      if (url.pathname === "/" || url.pathname === "/gallery") {
        await sendFile(request, response, path.join(publicRoot, "index.html"));
        return;
      }

      if (url.pathname.startsWith("/gallery/")) {
        if (
          await sendProjectModule(
            request,
            response,
            publicRoot,
            url.pathname.slice("/gallery".length),
            rawModule,
          )
        ) return;
      }

      const allowedProjectPrefixes = [
        "/skills/",
        "/dev/example-gallery/",
        "/node_modules/",
      ];
      if (includeFixtures) {
        allowedProjectPrefixes.push("/dev/example-gallery/fixtures/");
      }
      if (
        allowedProjectPrefixes.some((prefix) =>
          url.pathname.startsWith(prefix)
        )
      ) {
        if (
          await sendProjectModule(
            request,
            response,
            projectRoot,
            url.pathname,
            rawModule,
          )
        ) return;
      }

      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(`Example gallery error: ${error.message}`);
    }
  });
}

function openBrowser(url) {
  const command = process.platform === "darwin"
    ? ["open", [url]]
    : process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : ["xdg-open", [url]];
  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

export async function startExampleGallery(options = {}) {
  const server = createExampleGalleryServer(options);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 4173, options.host ?? "127.0.0.1", resolve);
  });
  const address = server.address();
  const host = options.host === "0.0.0.0" ? "127.0.0.1" : options.host;
  const url = `http://${host}:${address.port}/`;
  return { server, url };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const { url } = await startExampleGallery(options);
    console.log(`Three.js example gallery: ${url}`);
    console.log("Press Ctrl+C to stop.");
    if (options.open) openBrowser(url);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
