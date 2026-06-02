import type { BridgeEvent } from "./harbour-bridge";
import type { WindData } from "./wind";
import type { RiskAssessment } from "./risk";

export async function postDiscordAlert(
  events: BridgeEvent[],
  wind?: WindData,
  risk?: RiskAssessment,
): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) throw new Error("DISCORD_WEBHOOK_URL is not set");

  const windField = wind
    ? { name: "Wind", value: `${wind.speed} km/h · Gust ${wind.gust} km/h · ${wind.direction}`, inline: true }
    : null;
  const riskField = risk
    ? { name: "Wind Risk", value: risk.level.toUpperCase(), inline: true }
    : null;

  const embeds = events.map((e) => ({
    title: `Auckland Harbour Bridge — ${e.category === "closure" ? "CLOSED" : "INCIDENT"}`,
    color: e.category === "closure" ? 0xff0000 : 0xff8c00,
    fields: [
      e.eventType ? { name: "Type", value: e.eventType, inline: true } : null,
      e.impact ? { name: "Impact", value: e.impact, inline: true } : null,
      e.startNice ? { name: "Started", value: e.startNice, inline: true } : null,
      e.endNice ? { name: "Expected end", value: e.endNice, inline: true } : null,
      e.expectedResolution ? { name: "Expected clear", value: e.expectedResolution, inline: true } : null,
      windField,
      riskField,
      e.description ? { name: "Details", value: e.description.slice(0, 1024) } : null,
    ].filter(Boolean),
    url: e.sourceUrl,
    footer: { text: "NZTA / Waka Kotahi Journey Planner" },
  }));

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord webhook returned ${res.status}: ${body.slice(0, 200)}`);
  }
}
