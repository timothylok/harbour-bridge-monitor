import type { BridgeEvent } from "@/lib/harbour-bridge";
import styles from "./cards.module.css";

function deriveLanes(events: BridgeEvent[]) {
  const closures = events.filter((e) => e.category === "closure");
  if (closures.length === 0) {
    return [
      { direction: "Northbound", status: "open" as const },
      { direction: "Southbound", status: "open" as const },
    ];
  }
  const fields = (e: BridgeEvent) => [e.impact, e.location, e.eventType].join(" ").toLowerCase();
  const nb = closures.some((e) => fields(e).includes("north"));
  const sb = closures.some((e) => fields(e).includes("south"));
  const unknown = !nb && !sb;
  return [
    { direction: "Northbound", status: (nb || unknown ? "affected" : "open") as "open" | "affected" },
    { direction: "Southbound", status: (sb || unknown ? "affected" : "open") as "open" | "affected" },
  ];
}

interface Props {
  events: BridgeEvent[];
}

export default function LaneCard({ events }: Props) {
  const lanes = deriveLanes(events);
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>Lanes · SH1</span>
      {lanes.map((lane) => (
        <div key={lane.direction} className={styles.laneRow}>
          <span className={styles.laneDir}>{lane.direction}</span>
          <span className={`${styles.laneStatus} ${lane.status === "open" ? styles.laneOpen : styles.laneAffected}`}>
            {lane.status}
          </span>
        </div>
      ))}
    </div>
  );
}
