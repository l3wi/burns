import { handleAgentRoutes } from "@/server/routes/agent-routes"
import { handleApprovalRoutes } from "@/server/routes/approval-routes"
import { handleDiagnosticsRoutes } from "@/server/routes/diagnostics-routes"
import { handleHealthRequest } from "@/server/routes/health-routes"
import { handleRunRoutes } from "@/server/routes/run-routes"
import { handleSettingsRoutes } from "@/server/routes/settings-routes"
import { handleWorkflowRoutes } from "@/server/routes/workflow-routes"
import { handleWorkspaceRoutes } from "@/server/routes/workspace-routes"

const jsonHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
}

export function createApp() {
  return {
    port: 7332,
    async fetch(request: Request) {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: jsonHeaders })
      }

      const url = new URL(request.url)
      const pathname = url.pathname

      const response =
        (pathname === "/api/health" ? handleHealthRequest() : null) ??
        handleAgentRoutes(pathname) ??
        (await handleWorkspaceRoutes(request, pathname)) ??
        (await handleWorkflowRoutes(request, pathname)) ??
        handleRunRoutes(pathname) ??
        handleApprovalRoutes(pathname) ??
        handleSettingsRoutes(pathname) ??
        handleDiagnosticsRoutes(pathname)

      if (!response) {
        return Response.json({ error: "Not found" }, { status: 404, headers: jsonHeaders })
      }

      const nextHeaders = new Headers(response.headers)
      Object.entries(jsonHeaders).forEach(([key, value]) => nextHeaders.set(key, value))

      return new Response(response.body, {
        status: response.status,
        headers: nextHeaders,
      })
    },
  }
}
