import { fetchBridgeEvents } from "@/lib/harbour-bridge";
import { fetchWind } from "@/lib/wind";
import { computeRisk } from "@/lib/risk";
import type { BridgeEvent } from "@/lib/harbour-bridge";

export const dynamic = "force-dynamic";

function deriveLanes(events: BridgeEvent[]) {
  const closures = events.filter((e) => e.category === "closure");
  if (closures.length === 0) {
    return [
      { direction: "northbound", status: "open" },
      { direction: "southbound", status: "open" },
    ];
  }
  const fields = (e: BridgeEvent) => [e.impact, e.location, e.eventType].join(" ").toLowerCase();
  const nb = closures.some((e) => fields(e).includes("north"));
  const sb = closures.some((e) => fields(e).includes("south"));
  const unknown = !nb && !sb;
  return [
    { direction: "northbound", status: nb || unknown ? "affected" : "open" },
    { direction: "southbound", status: sb || unknown ? "affected" : "open" },
  ];
}

export async function GET() {
  const [wind, events] = await Promise.all([fetchWind(), fetchBridgeEvents()]);
  const risk = computeRisk(wind?.gust ?? null);

  return Response.json({
    timestamp: new Date().toISOString(),
    wind: wind
      ? { speed: wind.speed, gust: wind.gust, direction: wind.direction }
      : null,
    risk: { level: risk.level, reason: risk.reason },
    lanes: deriveLanes(events),
    events: events.map((e) => ({ id: e.id, category: e.category, location: e.location })),
  });
}
