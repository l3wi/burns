import { join } from "node:path"

const webAppDir = join(import.meta.dir, "..", "..", "web")

console.log("[desktop][preBuild] Building web app for desktop packaging...")

const result = Bun.spawnSync(["bun", "run", "build"], {
  cwd: webAppDir,
  stdout: "inherit",
  stderr: "inherit",
})

if (result.exitCode !== 0) {
  throw new Error(`[desktop][preBuild] Web build failed with exit code ${result.exitCode}`)
}

console.log("[desktop][preBuild] Web build complete")
