import { createApp } from "@/server/app"
import { initializeWorkspaceService } from "@/services/workspace-service"

initializeWorkspaceService()

const app = createApp()

console.log(`Mr. Burns daemon listening on http://localhost:${app.port}`)

Bun.serve(app)
