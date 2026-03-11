import { randomUUID } from "node:crypto"

import { afterEach, describe, expect, it } from "bun:test"

import { insertWorkspaceRow } from "@/db/repositories/workspace-repository"
import { createApp } from "@/server/app"

const originalFetch = globalThis.fetch

function seedWorkspace(params: {
  runtimeMode?: "burns-managed" | "self-managed"
  smithersBaseUrl?: string
} = {}) {
  const workspaceId = `test-workspace-${randomUUID()}`
  const now = new Date().toISOString()

  insertWorkspaceRow({
    id: workspaceId,
    name: workspaceId,
    path: `/tmp/${workspaceId}`,
    sourceType: "create",
    runtimeMode: params.runtimeMode ?? "burns-managed",
    smithersBaseUrl: params.smithersBaseUrl,
    healthStatus: "healthy",
    createdAt: now,
    updatedAt: now,
  })

  return workspaceId
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe("workspace routes", () => {
  it("returns workspace server status", async () => {
    const app = createApp()
    const workspaceId = seedWorkspace()

    const response = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${workspaceId}/server/status`, {
        method: "GET",
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      workspaceId,
      processState: "disabled",
    })
  })

  it("supports server control actions", async () => {
    const app = createApp()
    const workspaceId = seedWorkspace()

    for (const action of ["start", "restart", "stop"] as const) {
      const response = await app.fetch(
        new Request(`http://localhost:7332/api/workspaces/${workspaceId}/server/${action}`, {
          method: "POST",
        })
      )

      expect(response.status).toBe(200)
      expect(await response.json()).toMatchObject({
        workspaceId,
        processState: "disabled",
      })
    }
  })

  it("returns 404 for server routes when workspace does not exist", async () => {
    const app = createApp()
    const missingWorkspaceId = `missing-${randomUUID()}`

    const statusResponse = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${missingWorkspaceId}/server/status`, {
        method: "GET",
      })
    )
    expect(statusResponse.status).toBe(404)

    const actionResponse = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${missingWorkspaceId}/server/start`, {
        method: "POST",
      })
    )
    expect(actionResponse.status).toBe(404)
  })

  it("probes self-managed heartbeat in workspace server status route", async () => {
    const app = createApp()
    const workspaceId = seedWorkspace({
      runtimeMode: "self-managed",
      smithersBaseUrl: "http://127.0.0.1:8123",
    })
    globalThis.fetch = (async () => Response.json({ runs: [] })) as unknown as typeof fetch

    const response = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${workspaceId}/server/status`, {
        method: "GET",
      })
    )

    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      processState: string
      runtimeMode: string
      lastHeartbeatAt: string | null
      baseUrl: string | null
    }
    expect(payload.processState).toBe("self-managed")
    expect(payload.runtimeMode).toBe("self-managed")
    expect(payload.baseUrl).toBe("http://127.0.0.1:8123")
    expect(typeof payload.lastHeartbeatAt).toBe("string")
  })
})
