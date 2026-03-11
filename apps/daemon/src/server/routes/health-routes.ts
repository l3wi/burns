export function handleHealthRequest() {
  return Response.json({
    ok: true,
    service: "mr-burns-daemon",
  })
}
