import { fetchBridgeEvents, isNew } from "@/lib/harbour-bridge";
import { fetchWind } from "@/lib/wind";
import { computeRisk } from "@/lib/risk";
import { postDiscordAlert } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET() {
  const [events, wind] = await Promise.all([fetchBridgeEvents(), fetchWind()]);
  const newEvents = events.filter(isNew);

  if (newEvents.length > 0) {
    const risk = computeRisk(wind?.gust ?? null);
    await postDiscordAlert(newEvents, wind ?? undefined, risk);
  }

  return Response.json({
    checked: events.length,
    alerted: newEvents.length,
    events: newEvents.map((e) => ({ id: e.id, category: e.category, location: e.location })),
  });
}
