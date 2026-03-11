export function handleSettingsRoutes(pathname: string) {
  if (pathname === "/api/settings") {
    return Response.json({
      workspaceRoot: "/Users/lewi/MrBurns/repos",
      defaultAgent: "Claude Code",
      smithersBaseUrl: "http://localhost:7331",
      allowNetwork: false,
    })
  }

  return null
}
