import { fetchBridgeEvents } from "@/lib/harbour-bridge";
import styles from "./page.module.css";

export const revalidate = 1800;

export default async function Home() {
  const events = await fetchBridgeEvents();
  const disrupted = events.length > 0;

  const now = new Date();
  const checkedAt = now.toLocaleString("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-NZ", {
    timeZone: "Pacific/Auckland",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <header className={styles.header}>
        <span className={styles.tag}>SH1 · Northern Motorway</span>
        <span className={styles.tag}>{dateStr}</span>
      </header>

      <main className={styles.main}>

        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>Auckland</span>
          <h1 className={styles.title}>
            <span>Harbour</span>
            <span className={styles.titleOutline}>Bridge</span>
          </h1>
        </div>

        <div className={styles.statusBlock}>
          <div className={`${styles.orb} ${disrupted ? styles.orbDisrupted : styles.orbClear}`}>
            <div className={styles.orbCore} />
            <div className={styles.orbRing} />
          </div>

          <div className={styles.statusReadout}>
            <div className={`${styles.statusWord} ${disrupted ? styles.statusWordDisrupted : styles.statusWordClear}`}>
              {disrupted ? "DISRUPTED" : "CLEAR"}
            </div>
            <div className={styles.statusDetail}>
              {disrupted
                ? `${events.length} active event${events.length > 1 ? "s" : ""} detected`
                : "No active closures or incidents"}
            </div>
          </div>
        </div>

        {disrupted && (
          <div className={styles.events}>
            {events.map((e, i) => (
              <div key={i} className={styles.eventCard}>
                <div className={styles.eventTop}>
                  <span className={styles.eventBadge}>{e.category}</span>
                  <span className={styles.eventType}>{e.eventType || e.impact || "—"}</span>
                </div>
                {e.description && (
                  <p className={styles.eventDesc}>{e.description}</p>
                )}
                <div className={styles.eventMeta}>
                  {e.startNice && <span>Started {e.startNice}</span>}
                  {e.expectedResolution && <span>Expected clear {e.expectedResolution}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <footer className={styles.footer}>
        <span>Checked {checkedAt} NZT</span>
        <span className={styles.footerSep} aria-hidden="true">·</span>
        <a
          href="https://www.journeys.nzta.govt.nz/highway-conditions/traffic-and-travel-list-view"
          className={styles.footerLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          NZTA source
        </a>
      </footer>
    </div>
  );
}
