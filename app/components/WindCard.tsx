import type { WindData } from "@/lib/wind";
import type { RiskLevel } from "@/lib/risk";
import { computeRisk } from "@/lib/risk";
import styles from "./cards.module.css";

const gustClass: Record<RiskLevel, string> = {
  low:     styles.gustLow,
  medium:  styles.gustMedium,
  high:    styles.gustHigh,
  severe:  styles.gustSevere,
  extreme: styles.gustExtreme,
};

interface Props {
  wind: WindData | null;
}

export default function WindCard({ wind }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.cardLabel}>Wind · Harbour Bridge</span>
      {wind ? (
        <>
          <div className={styles.windSpeed}>
            <span className={styles.windValue}>{wind.speed}</span>
            <span className={styles.windUnit}>km/h</span>
          </div>
          <div className={styles.windMeta}>
            <div className={styles.windMetaItem}>
              <span className={styles.windMetaLabel}>Gust</span>
              <span className={`${styles.gustBadge} ${gustClass[computeRisk(wind.gust).level]}`}>
                {wind.gust} km/h
              </span>
            </div>
            <div className={styles.windMetaItem}>
              <span className={styles.windMetaLabel}>Direction</span>
              <span className={styles.windMetaValue}>{wind.direction}</span>
            </div>
          </div>
        </>
      ) : (
        <span className={styles.unavailable}>Wind data unavailable</span>
      )}
    </div>
  );
}
