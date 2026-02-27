#!/usr/bin/env node
/**
 * Measure bundle sizes from dist output.
 * Run after: npm run build
 * Writes static/bundle-size.json for the site to display.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { gzipSync } from "zlib";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

const CROPPER_FILES = [
  "composables/create-cropper.svelte.js",
  "core/crop-engine.svelte.js",
  "core/image-loader.svelte.js",
  "core/coordinate-system.js",
  "core/constraints.js",
  "core/export.js",
  "core/interactions.js",
  "core/keyboard.js",
  "core/types.js",
  "components/Cropper.svelte.js",
  "components/CropStencil.svelte.js",
  "components/CropOverlay.svelte.js",
  "components/DragHandle.svelte.js",
  "components/GridOverlay.svelte.js",
];

function measure(files) {
  let total = 0;
  for (const f of files) {
    const p = join(dist, f);
    if (existsSync(p)) {
      total += readFileSync(p, "utf8").length;
    }
  }
  const gzip = gzipSync(
    Buffer.concat(
      files.map((f) => {
        const p = join(dist, f);
        return existsSync(p) ? readFileSync(p) : Buffer.alloc(0);
      }),
    ),
  );
  return { raw: total, gzip: gzip.length };
}

if (!existsSync(dist)) {
  console.error("Run 'npm run build' first.");
  process.exit(1);
}

const cropper = measure(CROPPER_FILES);

// All dist JS files for full library
const allJs = readdirSync(dist, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory()
    ? readdirSync(join(dist, e.name), { withFileTypes: true })
        .filter((x) => x.name.endsWith(".js"))
        .map((x) => join(e.name, x.name))
    : e.name.endsWith(".js")
      ? [e.name]
      : [],
);

let fullRaw = 0;
let fullBuf = Buffer.alloc(0);
for (const f of allJs) {
  const p = join(dist, f);
  const b = readFileSync(p);
  fullRaw += b.length;
  fullBuf = Buffer.concat([fullBuf, b]);
}
const fullGzip = gzipSync(fullBuf).length;

const out = {
  cropper: {
    raw: cropper.raw,
    gzip: cropper.gzip,
    gzipKb: (cropper.gzip / 1024).toFixed(1),
  },
  full: {
    raw: fullRaw,
    gzip: fullGzip,
    gzipKb: (fullGzip / 1024).toFixed(1),
  },
};

const outPath = join(root, "static", "bundle-size.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(
  `Wrote ${outPath}: cropper ${out.cropper.gzipKb}KB gzipped, full ${out.full.gzipKb}KB gzipped`,
);
