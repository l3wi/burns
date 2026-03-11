import { BurnsClient } from "@mr-burns/client"

export const burnsClient = new BurnsClient(
  import.meta.env.VITE_BURNS_API_URL ?? "http://localhost:7332"
)
