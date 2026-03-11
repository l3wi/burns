export const defaultWorkflowTemplates = [
  {
    id: "issue-to-pr",
    source: `export default smithers((ctx) => (\n  <Workflow name=\"issue-to-pr\">\n    <Task id=\"plan\" output=\"plan\">\n      Plan the implementation.\n    </Task>\n    <Ralph id=\"impl-loop\">\n      <Task id=\"implement\" output=\"implement\">\n        Implement using ctx.input.specPath.\n      </Task>\n      <Task id=\"validate\" output=\"validate\">\n        Run checks and summarize failures.\n      </Task>\n    </Ralph>\n  </Workflow>\n))`,
  },
  {
    id: "pr-feedback",
    source: `export default smithers(() => (\n  <Workflow name=\"pr-feedback\">\n    <Task id=\"collect\" output=\"collect\">\n      Gather review comments and classify severity.\n    </Task>\n    <Task id=\"patch\" output=\"patch\">\n      Prepare code changes that address blocking feedback.\n    </Task>\n  </Workflow>\n))`,
  },
  {
    id: "approval-gate",
    source: `export default smithers(() => (\n  <Workflow name=\"approval-gate\">\n    <Task id=\"prepare\" output=\"prepare\">\n      Prepare deployment notes and evidence.\n    </Task>\n    <Task id=\"deploy\" needsApproval>\n      Wait for operator approval before deploying.\n    </Task>\n  </Workflow>\n))`,
  },
] as const
