import { randomUUID } from "node:crypto"

import { describe, expect, it } from "bun:test"

import { insertWorkspaceRow } from "@/db/repositories/workspace-repository"
import { createApp } from "@/server/app"
import { resolveTestWorkspacePath } from "@/testing/test-workspace-path"

function seedWorkspace() {
  const workspaceId = `test-workspace-${randomUUID()}`
  const now = new Date().toISOString()

  insertWorkspaceRow({
    id: workspaceId,
    name: workspaceId,
    path: resolveTestWorkspacePath(workspaceId),
    sourceType: "create",
    runtimeMode: "burns-managed",
    healthStatus: "healthy",
    createdAt: now,
    updatedAt: now,
  })

  return workspaceId
}

const validWorkflowSource = `import { createSmithers, Sequence } from "smithers-orchestrator"
import { z } from "zod"

const { Workflow, Task, smithers, outputs } = createSmithers({
  plan: z.object({ summary: z.string() }),
})

export default smithers(() => (
  <Workflow name="valid-workflow">
    <Sequence>
      <Task id="plan" output={outputs.plan}>
        {{ summary: "ready" }}
      </Task>
    </Sequence>
  </Workflow>
))
`

const invalidLegacySource = `import { Sequence } from "smithers-orchestrator"

export default smithers(() => (
  <Workflow name="legacy">
    <Task id="plan" output="plan">Legacy</Task>
  </Workflow>
))
`

describe("workflow routes", () => {
  it("saves valid workflow source", async () => {
    const app = createApp()
    const workspaceId = seedWorkspace()

    const response = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${workspaceId}/workflows/custom-flow`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: validWorkflowSource }),
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      id: "custom-flow",
      workspaceId,
      name: "custom-flow",
    })
  })

  it("rejects invalid legacy-style workflow source", async () => {
    const app = createApp()
    const workspaceId = seedWorkspace()

    const response = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${workspaceId}/workflows/custom-flow`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: invalidLegacySource }),
      })
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining("createSmithers"),
    })
  })

  it("streams authoring errors for generate/stream requests", async () => {
    const app = createApp()
    const missingWorkspaceId = `missing-${randomUUID()}`

    const response = await app.fetch(
      new Request(`http://localhost:7332/api/workspaces/${missingWorkspaceId}/workflows/generate/stream`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "streamed-workflow",
          agentId: "codex",
          prompt: "Create a workflow",
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("application/x-ndjson")

    const body = await response.text()
    const events = body
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line))

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      type: "error",
      message: expect.stringContaining("Workspace not found"),
    })
  })
})
