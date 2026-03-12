import { join } from "node:path";

const webDistDir = join(import.meta.dir, "..", "..", "web", "dist");
const desktopViewsDir = join(import.meta.dir, "..", "dist", "views");

console.log("[desktop][postBuild] Syncing web assets into desktop build output...");
console.log(
  "[desktop][postBuild] TODO: Replace placeholder with deterministic copy once final ElectroBun output layout is confirmed.",
);
console.log(`[desktop][postBuild] Placeholder source: ${webDistDir}`);
console.log(`[desktop][postBuild] Placeholder destination: ${desktopViewsDir}`);
