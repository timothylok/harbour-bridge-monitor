const JOURNEY_BASE = "https://www.journeys.nzta.govt.nz";
const DATA_URL = `${JOURNEY_BASE}/assets/map-data-cache/delays.json`;
const BRIDGE_KEYWORDS = ["harbour bridge", "auckland harbour bridge"];
const BRIDGE_BOUNDS = {
  minLat: -36.855, maxLat: -36.825,
  minLon: 174.733, maxLon: 174.755,
};
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

function matchesBridge(feature: { geometry?: { coordinates?: number[] } | null; properties?: { LocationArea?: string } }): boolean {
  const coords = feature.geometry?.coordinates;
  if (coords) {
    const [lng, lat] = coords;
    return (
      lat >= BRIDGE_BOUNDS.minLat && lat <= BRIDGE_BOUNDS.maxLat &&
      lng >= BRIDGE_BOUNDS.minLon && lng <= BRIDGE_BOUNDS.maxLon
    );
  }
  const location = (feature.properties?.LocationArea ?? "").toLowerCase();
  return BRIDGE_KEYWORDS.some((k) => location.includes(k));
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
    if (!matchesBridge(feature)) continue;
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
