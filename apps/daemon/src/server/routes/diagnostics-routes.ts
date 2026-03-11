import { getDoctorSummary } from "@/services/diagnostics-service"

export function handleDiagnosticsRoutes(pathname: string) {
  if (pathname === "/api/doctor") {
    return Response.json(getDoctorSummary())
  }

  return null
}
