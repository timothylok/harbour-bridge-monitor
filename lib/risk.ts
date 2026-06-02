export type RiskLevel = "low" | "medium" | "high" | "severe" | "extreme";

export interface RiskAssessment {
  level: RiskLevel;
  reason: string;
}

export function computeRisk(gustKmh: number | null): RiskAssessment {
  if (gustKmh === null) return { level: "low", reason: "Wind data unavailable" };
  if (gustKmh >= 90) return { level: "extreme", reason: `Wind gust ${gustKmh} km/h — full closure possible` };
  if (gustKmh >= 75) return { level: "severe",  reason: `Wind gust ${gustKmh} km/h — lane closures likely` };
  if (gustKmh >= 65) return { level: "high",    reason: `Wind gust ${gustKmh} km/h — high-sided vehicles detoured` };
  if (gustKmh >= 55) return { level: "medium",  reason: `Wind gust ${gustKmh} km/h — speed restrictions likely` };
  return { level: "low", reason: `Wind gust ${gustKmh} km/h` };
}
