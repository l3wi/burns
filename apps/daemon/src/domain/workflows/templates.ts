export const defaultWorkflowTemplates = [
  {
    id: "issue-to-pr",
    source: `import { createSmithers, Sequence } from "smithers-orchestrator"\nimport { z } from "zod"\n\nconst { Workflow, Task, smithers, outputs } = createSmithers({\n  plan: z.object({ summary: z.string() }),\n  implement: z.object({ summary: z.string() }),\n  validate: z.object({ summary: z.string() }),\n  summarize: z.object({ summary: z.string() }),\n})\n\nexport default smithers((ctx) => (\n  <Workflow name="issue-to-pr">\n    <Sequence>\n      <Task id="plan" output={outputs.plan}>\n        {{ summary: \`Plan generated from input: \${JSON.stringify(ctx.input ?? {})}\` }}\n      </Task>\n      <Task id="implement" output={outputs.implement}>\n        {{ summary: "Implementation completed." }}\n      </Task>\n      <Task id="validate" output={outputs.validate}>\n        {{ summary: "Validation completed." }}\n      </Task>\n      <Task id="summarize" output={outputs.summarize}>\n        {{ summary: "Workflow finished." }}\n      </Task>\n    </Sequence>\n  </Workflow>\n))`,
  },
  {
    id: "pr-feedback",
    source: `import { createSmithers, Sequence } from "smithers-orchestrator"\nimport { z } from "zod"\n\nconst { Workflow, Task, smithers, outputs } = createSmithers({\n  collect: z.object({ summary: z.string() }),\n  patch: z.object({ summary: z.string() }),\n})\n\nexport default smithers(() => (\n  <Workflow name="pr-feedback">\n    <Sequence>\n      <Task id="collect" output={outputs.collect}>\n        {{ summary: "Collected review feedback." }}\n      </Task>\n      <Task id="patch" output={outputs.patch}>\n        {{ summary: "Prepared patch for feedback." }}\n      </Task>\n    </Sequence>\n  </Workflow>\n))`,
  },
  {
    id: "approval-gate",
    source: `import { createSmithers, Sequence } from "smithers-orchestrator"\nimport { z } from "zod"\n\nconst { Workflow, Task, smithers, outputs } = createSmithers({\n  prepare: z.object({ summary: z.string() }),\n  deploy: z.object({ summary: z.string() }),\n})\n\nexport default smithers(() => (\n  <Workflow name="approval-gate">\n    <Sequence>\n      <Task id="prepare" output={outputs.prepare}>\n        {{ summary: "Prepared deployment notes and evidence." }}\n      </Task>\n      <Task id="deploy" output={outputs.deploy} needsApproval>\n        {{ summary: "Deployment approved and completed." }}\n      </Task>\n    </Sequence>\n  </Workflow>\n))`,
  },
] as const
