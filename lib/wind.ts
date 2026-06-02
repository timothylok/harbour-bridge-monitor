const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-36.840&longitude=174.742" +
  "&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=Pacific%2FAuckland";

export interface WindData {
  speed: number;
  gust: number;
  direction: string;
  timestamp: string;
}

function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function fetchWind(): Promise<WindData | null> {
  try {
    const res = await fetch(OPEN_METEO_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const c = data.current;
    if (!c) return null;
    return {
      speed: Math.round(c.wind_speed_10m),
      gust: Math.round(c.wind_gusts_10m),
      direction: degreesToCardinal(c.wind_direction_10m),
      timestamp: c.time as string,
    };
  } catch {
    return null;
  }
}
