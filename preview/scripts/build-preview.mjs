import { cp, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const previewRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(previewRoot, "..", "..");
const destination = resolve(previewRoot, "dist");
const viteCli = resolve(repositoryRoot, "node_modules", "vite", "bin", "vite.js");

const result = spawnSync(process.execPath, [viteCli, "build", "--outDir", destination], {
  cwd: repositoryRoot,
  stdio: "inherit",
});

if (result.status !== 0) process.exit(result.status ?? 1);

await mkdir(resolve(destination, "server"), { recursive: true });
await writeFile(resolve(destination, "server", "index.js"), `
export default {
  async fetch(request, env) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
  },
};
`.trimStart());
