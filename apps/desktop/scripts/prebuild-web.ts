import { join } from "node:path";

const webAppDir = join(import.meta.dir, "..", "..", "web");

console.log("[desktop][preBuild] Building web app for desktop packaging...");
console.log(
  "[desktop][preBuild] TODO: Confirm ElectroBun lifecycle context and whether this should run `bun run build` in apps/web.",
);
console.log(`[desktop][preBuild] Placeholder path: ${webAppDir}`);
