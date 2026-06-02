import type { RiskLevel } from "@/lib/risk";
import styles from "./cards.module.css";

const levelClass: Record<RiskLevel, string> = {
  low:     styles.low,
  medium:  styles.medium,
  high:    styles.high,
  severe:  styles.severe,
  extreme: styles.extreme,
};

interface Props {
  level: RiskLevel;
  reason: string;
}

export default function RiskBadge({ level, reason }: Props) {
  return (
    <div className={styles.riskBadge}>
      <span className={`${styles.riskPill} ${levelClass[level]}`}>
        Wind Risk · {level}
      </span>
      <span className={styles.riskReason}>{reason}</span>
    </div>
  );
}
