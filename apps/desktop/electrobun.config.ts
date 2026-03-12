import { join } from "node:path";

function runHookScript(relativeScriptPath: string): void {
  const scriptPath = join(import.meta.dir, relativeScriptPath);
  const result = Bun.spawnSync(["bun", scriptPath], {
    cwd: import.meta.dir,
    stdout: "inherit",
    stderr: "inherit",
  });

  if (result.exitCode !== 0) {
    throw new Error(
      `[desktop] ElectroBun hook failed: ${relativeScriptPath} (exit ${result.exitCode}).`,
    );
  }
}

const config = {
  build: {
    bun: {
      entrypoint: "./src/main.ts",
    },
    views: {
      from: "../web/dist",
      to: "views",
      entry: "index.html",
    },
    copy: [
      {
        from: "../web/public",
        to: "views/public",
      },
    ],
  },
  hooks: {
    preBuild: async () => {
      runHookScript("./scripts/prebuild-web.ts");
    },
    postBuild: async () => {
      runHookScript("./scripts/copy-web-assets.ts");
    },
  },
};

export default config;
