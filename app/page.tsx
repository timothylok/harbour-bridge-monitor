import { fetchBridgeEvents } from "@/lib/harbour-bridge";
import styles from "./page.module.css";

export const revalidate = 1800;

export default async function Home() {
  const events = await fetchBridgeEvents();
  const disrupted = events.length > 0;
  const checkedAt = new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" });

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Auckland Harbour Bridge</h1>

      <div className={disrupted ? styles.disrupted : styles.clear}>
        {disrupted ? "⚠ DISRUPTED" : "✓ CLEAR"}
      </div>

      {disrupted && (
        <ul className={styles.events}>
          {events.map((e, i) => (
            <li key={i} className={styles.event}>
              <span className={styles.badge}>{e.category}</span>
              <strong>{e.impact || e.eventType || e.category}</strong>
              {e.description && <p>{e.description}</p>}
              {e.startNice && <small>Started: {e.startNice}</small>}
              {e.expectedResolution && (
                <small> · Expected clear: {e.expectedResolution}</small>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disrupted && (
        <p className={styles.sub}>No active closures or incidents.</p>
      )}

      <footer className={styles.footer}>
        Checked: {checkedAt} NZT ·{" "}
        <a href="https://www.journeys.nzta.govt.nz/highway-conditions/traffic-and-travel-list-view">
          NZTA source
        </a>
      </footer>
    </main>
  );
}
