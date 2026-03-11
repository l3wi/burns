import { DEFAULT_AGENT, DEFAULT_SMITHERS_BASE_URL } from "@/config/app-config"
import { DEFAULT_WORKSPACES_ROOT } from "@/config/paths"

export function handleSettingsRoutes(pathname: string) {
  if (pathname === "/api/settings") {
    return Response.json({
      workspaceRoot: DEFAULT_WORKSPACES_ROOT,
      defaultAgent: DEFAULT_AGENT,
      smithersBaseUrl: DEFAULT_SMITHERS_BASE_URL,
      allowNetwork: false,
    })
  }

  return null
}
