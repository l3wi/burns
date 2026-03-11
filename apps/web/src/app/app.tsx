import { RouterProvider } from "react-router-dom"

import { QueryProvider } from "@/app/providers/query-provider"
import { router } from "@/app/router"
import { TooltipProvider } from "@/components/ui/tooltip"

export function App() {
  return (
    <QueryProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryProvider>
  )
}
