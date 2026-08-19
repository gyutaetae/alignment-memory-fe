import type { AlignmentOutcome, JobStatus } from "../types/api";
import styles from "./StatusBadge.module.css";

const labels: Record<AlignmentOutcome | JobStatus, { icon: string; label: string }> = {
  aligned: { icon: "✓", label: "Aligned" },
  direct_conflict: { icon: "!", label: "Direct Conflict" },
  missing_alignment: { icon: "?", label: "Missing Alignment" },
  queued: { icon: "·", label: "대기 중" },
  fetching: { icon: "↓", label: "수집 중" },
  analyzing: { icon: "⌕", label: "분석 중" },
  validating: { icon: "✓", label: "검증 중" },
  persisting: { icon: "↧", label: "저장 중" },
  writing_github: { icon: "↗", label: "GitHub 기록 중" },
  completed: { icon: "✓", label: "완료" },
  failed: { icon: "!", label: "실패" },
};

export function StatusBadge({ status }: { status: AlignmentOutcome | JobStatus }) {
  const item = labels[status];
  return (
    <span className={`${styles.badge} ${styles[status] ?? ""}`}>
      <span aria-hidden="true">{item.icon}</span>
      {item.label}
    </span>
  );
}
