import { randomUUID } from "node:crypto"

import { afterEach, describe, expect, it } from "bun:test"

import { findApprovalRow } from "@/db/repositories/approval-repository"
import { insertWorkspaceRow } from "@/db/repositories/workspace-repository"
import { decideApproval, listApprovals, syncApprovalFromEvent } from "@/services/approval-service"
import { resolveTestWorkspacePath } from "@/testing/test-workspace-path"

const originalFetch = globalThis.fetch

function seedWorkspace(workspaceId = `test-workspace-${randomUUID()}`) {
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

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe("approval service", () => {
  it("returns an empty approval list for new workspaces", () => {
    const workspaceId = seedWorkspace()

    expect(listApprovals(workspaceId)).toEqual([])
  })

  it("syncs pending then approved approval events for the same node", () => {
    const workspaceId = seedWorkspace()

    const pending = syncApprovalFromEvent({
      workspaceId,
      runId: "run-123",
      nodeId: "deploy",
      status: "pending",
      message: "Waiting for operator",
    })

    expect(pending).toMatchObject({
      workspaceId,
      runId: "run-123",
      nodeId: "deploy",
      status: "pending",
    })

    const approved = syncApprovalFromEvent({
      workspaceId,
      runId: "run-123",
      nodeId: "deploy",
      status: "approved",
      message: "Approved",
    })

    expect(approved).toMatchObject({
      workspaceId,
      runId: "run-123",
      nodeId: "deploy",
      status: "approved",
      note: "Approved",
    })
    expect(typeof approved.decidedAt).toBe("string")
  })

  it("decides an approval by updating the existing row and forwarding the decision", async () => {
    const workspaceId = seedWorkspace()

    const seeded = syncApprovalFromEvent({
      workspaceId,
      runId: "run-9",
      nodeId: "deploy",
      status: "pending",
      message: "Awaiting review",
    })

    const capturedRequests: Array<{ url: string; body: unknown }> = []
    globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
      const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined
      capturedRequests.push({ url: String(input), body })
      return Response.json({ ok: true })
    }) as typeof fetch

    const decided = await decideApproval({
      workspaceId,
      runId: "run-9",
      nodeId: "deploy",
      decision: "approved",
      input: {
        decidedBy: "lewi",
        note: "Ship it",
      },
    })

    expect(capturedRequests.some((request) => request.url.includes("/v1/runs/run-9/nodes/deploy/approve"))).toBe(true)
    expect(decided).toMatchObject({
      id: seeded.id,
      workspaceId,
      runId: "run-9",
      nodeId: "deploy",
      status: "approved",
      decidedBy: "lewi",
      note: "Ship it",
    })

    expect(findApprovalRow(workspaceId, "run-9", "deploy")).toMatchObject({
      id: seeded.id,
      status: "approved",
    })
  })
})
