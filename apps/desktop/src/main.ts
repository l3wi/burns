import { BrowserWindow } from "electrobun/bun";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildRuntimeConfigInitScript,
  resolveRuntimeConfig,
} from "./runtime-config";

function resolveDesktopIndexUrl(): string {
  const externalWebUrl = process.env.BURNS_DESKTOP_WEB_URL?.trim();
  if (externalWebUrl) {
    return externalWebUrl;
  }

  const indexPath = join(import.meta.dir, "..", "views", "index.html");
  return pathToFileURL(indexPath).toString();
}

function escapeScriptString(value: string): string {
  return JSON.stringify(value);
}

async function injectRuntimeConfig(window: BrowserWindow): Promise<void> {
  const script = buildRuntimeConfigInitScript(resolveRuntimeConfig());
  window.webview.executeJavascript(script);
}

async function startDesktopShell(): Promise<void> {
  console.log("[desktop] Starting desktop shell...");
  const desktopIndexUrl = resolveDesktopIndexUrl();
  console.log("[desktop] Desktop index URL:", desktopIndexUrl);

  const window = new BrowserWindow({
    title: "Mr. Burns",
    frame: {
      x: 80,
      y: 80,
      width: 1360,
      height: 900,
    },
    url: desktopIndexUrl,
  });
  console.log("[desktop] BrowserWindow created");

  window.webview.on("dom-ready", async () => {
    console.log("[desktop] Webview dom-ready");
    await injectRuntimeConfig(window);
  });

  window.webview.on("did-navigate", (event: unknown) => {
    const url = (event as { data?: { detail?: string } } | undefined)?.data?.detail;
    if (typeof url === "string" && url.startsWith("mrburns://")) {
      const script = `window.dispatchEvent(new CustomEvent("burns:deep-link", { detail: { url: ${escapeScriptString(url)} } }));`;
      window.webview.executeJavascript(script);
    }
  });

  window.show();
  window.focus();
  console.log("[desktop] Window shown and focused");
}

startDesktopShell().catch((error) => {
  console.error("[desktop] Failed to start desktop shell.", error);
  process.exitCode = 1;
});
