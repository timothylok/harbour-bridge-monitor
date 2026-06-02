import { fetchBridgeEvents, isNew } from "@/lib/harbour-bridge";
import { postDiscordAlert } from "@/lib/discord";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await fetchBridgeEvents();
  const newEvents = events.filter(isNew);

  if (newEvents.length > 0) {
    await postDiscordAlert(newEvents);
  }

  return Response.json({
    checked: events.length,
    alerted: newEvents.length,
    events: newEvents.map((e) => ({ id: e.id, category: e.category, location: e.location })),
  });
}
