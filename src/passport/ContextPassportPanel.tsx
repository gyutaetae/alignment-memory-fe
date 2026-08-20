import { useState } from "react";

import type { Evidence } from "../shared/types/api";
import { demoPersonas, type DemoPersona, type DemoPersonaId } from "../shared/demoPersonas";
import { useContextPassport } from "./api";
import styles from "./ContextPassportPanel.module.css";

export function ContextPassportPanel({
  alignmentId,
  evidence,
  persona,
  onPersonaChange,
}: {
  alignmentId: string;
  evidence: Evidence[];
  persona: DemoPersona;
  onPersonaChange: (persona: DemoPersonaId) => void;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const passport = useContextPassport(alignmentId, persona.language);

  return (
    <aside className={styles.panel} aria-labelledby="passport-heading">
      <div className={styles.header}>
        <div>
          <p>인수인계 맥락</p>
          <h2 id="passport-heading">Context Passport</h2>
        </div>
        <span className={styles.passportIcon} aria-hidden="true">▣</span>
      </div>

      <div className={styles.roleBlock}>
        <span>시연 역할 · 실제 분산 협업 배경을 재연</span>
        <div className={styles.roleSwitcher}>
          {Object.values(demoPersonas).map((candidate) => (
            <button
              aria-pressed={persona.id === candidate.id}
              className={persona.id === candidate.id ? styles.activeRole : ""}
              key={candidate.id}
              onClick={() => onPersonaChange(candidate.id)}
              type="button"
            >
              {candidate.label}
            </button>
          ))}
        </div>
      </div>

      {passport.isPending ? <p className={styles.state}>↻ 맥락 정보 로딩 중…</p> : null}
      {passport.isError ? (
        <div className={styles.state} role="alert">
          <span>! Passport를 불러올 수 없습니다.</span>
          <button onClick={() => void passport.refetch()} type="button">재시도</button>
        </div>
      ) : null}
      {passport.data ? (
        <>
          <dl className={styles.attributes}>
            <div><dt>선호 언어</dt><dd>{persona.languageLabel} · 자기 선언</dd></div>
            <div><dt>시간대</dt><dd>{persona.timezone} · 자기 선언</dd></div>
            <div><dt>역할</dt><dd>{persona.role}</dd></div>
            <div><dt>담당 범위</dt><dd>{persona.ownership}</dd></div>
          </dl>

          <div className={styles.handoff}>
            <h3>왜 중요한가</h3>
            <p>{passport.data.content}</p>
          </div>

          <label className={styles.toggle}>
            <input
              checked={showOriginal}
              onChange={(event) => setShowOriginal(event.target.checked)}
              type="checkbox"
            />
            <span>Passport에 원본 근거 표시</span>
          </label>

          {showOriginal ? (
            <div className={styles.original} aria-live="polite">
              {evidence
                .filter((item) => passport.data.sourceVersionIds.includes(item.sourceVersionId))
                .map((item) => <blockquote key={item.sourceVersionId}>{item.exactQuote}</blockquote>)}
            </div>
          ) : null}

          <div className={styles.questions}>
            <h3>미해결 질문</h3>
            {passport.data.ambiguities.length ? (
              <ul>{passport.data.ambiguities.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : <p>○ 기록된 미해결 질문이 없습니다.</p>}
          </div>
        </>
      ) : null}
    </aside>
  );
}
