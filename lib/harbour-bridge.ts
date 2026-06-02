const JOURNEY_BASE = "https://www.journeys.nzta.govt.nz";
const DATA_URL = `${JOURNEY_BASE}/assets/map-data-cache/delays.json`;
const BRIDGE_KEYWORDS = ["harbour bridge", "auckland harbour bridge"];
const ALERT_TYPES = new Set(["closures", "hazards", "warnings"]);
const THIRTY_ONE_MINUTES_MS = 31 * 60 * 1000;

export interface BridgeEvent {
  id: string | null;
  category: "closure" | "incident";
  eventType: string | null;
  impact: string | null;
  location: string | null;
  description: string | null;
  startEpoch: number | null;
  startNice: string | null;
  endNice: string | null;
  expectedResolution: string | null;
  sourceUrl: string;
}

export async function fetchBridgeEvents(): Promise<BridgeEvent[]> {
  const res = await fetch(DATA_URL, {
    headers: {
      Accept: "application/json",
      Referer: `${JOURNEY_BASE}/highway-conditions`,
      "User-Agent": "Mozilla/5.0 (compatible; harbour-bridge-monitor/1.0)",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`NZTA returned ${res.status}`);
  const payload = await res.json();

  const events: BridgeEvent[] = [];
  for (const feature of payload.features ?? []) {
    const props = feature.properties ?? {};
    const location: string = (props.LocationArea ?? "").toLowerCase();
    if (!BRIDGE_KEYWORDS.some((k) => location.includes(k))) continue;
    if (!ALERT_TYPES.has(props.type)) continue;

    events.push({
      id: props.id ?? props.ExternalId ?? null,
      category: props.type === "closures" ? "closure" : "incident",
      eventType: props.EventType ?? null,
      impact: props.Impact ?? null,
      location: props.LocationArea ?? null,
      description: props.EventDescription ?? null,
      startEpoch: props.StartDate ?? null,
      startNice: props.StartDateNice ?? null,
      endNice: props.EndDateNice ?? null,
      expectedResolution: props.ExpectedResolution ?? props.ExpectedResolutionText ?? null,
      sourceUrl: `${JOURNEY_BASE}/highway-conditions/traffic-and-travel-list-view`,
    });
  }
  return events;
}

export function isNew(event: BridgeEvent): boolean {
  if (event.startEpoch == null) return false;
  return Date.now() - event.startEpoch * 1000 < THIRTY_ONE_MINUTES_MS;
}
