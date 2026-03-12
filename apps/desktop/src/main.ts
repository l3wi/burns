import {
  loadDesktopRuntimeBindings,
  type DesktopWindow,
} from "./electrobun-assumptions";
import {
  buildRuntimeConfigInitScript,
  resolveRuntimeConfig,
} from "./runtime-config";

async function injectRuntimeConfig(window: DesktopWindow): Promise<void> {
  const script = buildRuntimeConfigInitScript(resolveRuntimeConfig());
  await window.webContents?.executeJavaScript?.(script);
}

async function startDesktopShell(): Promise<void> {
  const { app, createWindow, viewsIndexUrl } = await loadDesktopRuntimeBindings();

  await app.whenReady();

  const window = createWindow({
    title: "Mr. Burns",
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    show: true,
  });

  await window.loadURL(viewsIndexUrl);
  await injectRuntimeConfig(window);

  app.on("window-all-closed", () => {
    app.quit();
  });
}

startDesktopShell().catch((error) => {
  console.error("[desktop] Failed to start desktop shell.", error);
  process.exitCode = 1;
});
