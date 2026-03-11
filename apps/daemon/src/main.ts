import { createApp } from "@/server/app"

const app = createApp()

console.log(`Mr. Burns daemon listening on http://localhost:${app.port}`)

Bun.serve(app)
