import { randomUUID } from "node:crypto"
import { lstatSync, mkdtempSync, readlinkSync, rmSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"

import { afterEach, describe, expect, it } from "bun:test"

import { REPOSITORY_ROOT } from "@/config/paths"
import { deleteWorkspaceRowById, insertWorkspaceRow } from "@/db/repositories/workspace-repository"
import { startRun } from "@/services/smithers-service"

const originalFetch = globalThis.fetch
const workspacePathsToDelete = new Set<string>()
const workspaceIdsToDelete = new Set<string>()

function createWorkspacePath() {
  const workspacePath = mkdtempSync(path.join(tmpdir(), "burns-smithers-service-"))
  workspacePathsToDelete.add(workspacePath)
  return workspacePath
}

function seedWorkspace(workspacePath: string) {
  const workspaceId = `test-workspace-${randomUUID()}`
  const now = new Date().toISOString()

  insertWorkspaceRow({
    id: workspaceId,
    name: workspaceId,
    path: workspacePath,
    sourceType: "create",
    runtimeMode: "burns-managed",
    healthStatus: "healthy",
    createdAt: now,
    updatedAt: now,
  })

  workspaceIdsToDelete.add(workspaceId)
  return workspaceId
}

afterEach(() => {
  globalThis.fetch = originalFetch

  for (const workspaceId of workspaceIdsToDelete) {
    deleteWorkspaceRowById(workspaceId)
  }
  workspaceIdsToDelete.clear()

  for (const workspacePath of workspacePathsToDelete) {
    rmSync(workspacePath, { recursive: true, force: true })
  }
  workspacePathsToDelete.clear()
})

describe("smithers service", () => {
  it("ensures workspace dependency resolution exists before starting a run", async () => {
    const workspacePath = createWorkspacePath()
    const workspaceId = seedWorkspace(workspacePath)

    globalThis.fetch = (async () =>
      Response.json({
        run: {
          id: "run-123",
          workflowId: "echo",
          workflowName: "echo",
          status: "running",
          startedAt: "2026-03-13T00:00:00.000Z",
          summary: {
            finished: 0,
            inProgress: 1,
            pending: 0,
          },
        },
      })) as unknown as typeof fetch

    const run = await startRun(workspaceId, {
      workflowId: "echo",
      input: { task: "hello" },
    })

    expect(run).toMatchObject({
      id: "run-123",
      workspaceId,
      workflowId: "echo",
      status: "running",
    })

    const nodeModulesPath = path.join(workspacePath, "node_modules")
    expect(lstatSync(nodeModulesPath).isSymbolicLink()).toBe(true)
    expect(readlinkSync(nodeModulesPath)).toBe(path.join(REPOSITORY_ROOT, "node_modules"))
  })
})
