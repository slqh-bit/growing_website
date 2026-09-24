import { getPayload } from "payload";
import config from "@payload-config";

// Liveness + readiness for Docker's HEALTHCHECK and uptime monitors: the app
// answers and the database is reachable (a cheap count, no documents loaded).
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const payload = await getPayload({ config });
    await payload.count({ collection: "services", overrideAccess: true });
    return Response.json(
      { status: "ok", db: "ok", ms: Date.now() - started },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[health] database check failed:", error);
    return Response.json(
      { status: "error", db: "unreachable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
