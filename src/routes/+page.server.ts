import { readFileSync } from "fs";
import { join } from "path";

export interface BundleSize {
  cropper: { raw: number; gzip: number; gzipKb: string };
  full: { raw: number; gzip: number; gzipKb: string };
}

export function load(): { bundleSize: BundleSize | null } {
  try {
    const path = join(process.cwd(), "static", "bundle-size.json");
    const data = JSON.parse(readFileSync(path, "utf8")) as BundleSize;
    return { bundleSize: data };
  } catch {
    return { bundleSize: null };
  }
}
