import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { AlignmentFeedback } from "../feedback/AlignmentFeedback";
import { ContextPassportPanel } from "../passport/ContextPassportPanel";
import { AsyncState } from "../shared/components/AsyncState";
import { StatusBadge } from "../shared/components/StatusBadge";
import { useAlignment } from "./api";
import styles from "./AlignmentDetailScreen.module.css";

export function AlignmentDetailScreen() {
  const { alignmentId } = useParams();
  const alignment = useAlignment(alignmentId);
  const [revealedEvidence, setRevealedEvidence] = useState<Set<string>>(() => new Set());

  if (alignment.isPending) {
    return <AsyncState kind="loading" title="Alignment Diff 로딩 중" message="기존 합의, 제안된 변경, 검증된 근거를 불러오고 있습니다." />;
  }
  if (alignment.isError || !alignment.data) {
    return (
      <AsyncState
        actionLabel="다시 시도"
        kind="error"
        message="Alignment 상세 정보를 불러올 수 없습니다."
        onAction={() => void alignment.refetch()}
        title="Alignment 로드 실패"
      />
    );
  }

  const finding = alignment.data.findings[0];
  const allEvidence = alignment.data.findings.flatMap((item) => item.evidence);
  const existingAgreement = finding?.evidence[0]?.exactQuote ?? "충돌하는 활성 합의가 식별되지 않았습니다.";
  const proposedChange = finding?.explanation ?? "제안된 변경이 현재 기록된 맥락과 일치합니다.";

  const toggleEvidence = (findingId: string) => {
    setRevealedEvidence((current) => {
      const next = new Set(current);
      if (next.has(findingId)) next.delete(findingId);
      else next.add(findingId);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <Link to="/memory">← 프로젝트 메모리</Link>
          <p>Pull Request #{alignment.data.prNumber} · revision {alignment.data.knowledgeRevision}</p>
          <h1>Alignment Diff</h1>
        </div>
        <StatusBadge status={alignment.data.outcome} />
      </header>

      <section className={styles.diffHero} aria-label="Alignment Diff 비교">
        <article>
          <div className={styles.diffLabel}><span aria-hidden="true">◀</span> 기존 합의</div>
          <h2>{finding?.targetNodeType === "decision" ? "활성 Decision" : "기록된 프로젝트 맥락"}</h2>
          <blockquote>{existingAgreement}</blockquote>
          <small>Knowledge revision {alignment.data.knowledgeRevision} · {finding?.targetNodeStatus ?? "active"}</small>
        </article>
        <div className={styles.divider} aria-hidden="true">≠</div>
        <article>
          <div className={styles.diffLabel}><span aria-hidden="true">▶</span> 제안된 변경</div>
          <h2>PR #{alignment.data.prNumber}</h2>
          <p>{proposedChange}</p>
          <small>Head {alignment.data.headSha.slice(0, 8)}</small>
        </article>
      </section>

      <div className={styles.detailGrid}>
        <div className={styles.mainColumn}>
          <section className={styles.explanationCard}>
            <div>
              <span className={styles.sectionIcon} aria-hidden="true">!</span>
              <div>
                <p>영향</p>
                <h2>이 변경이 Alignment이 필요한 이유</h2>
              </div>
            </div>
            <p>{finding?.explanation ?? "검증된 충돌이 발견되지 않았습니다."}</p>
          </section>

          <section className={styles.explanationCard}>
            <div>
              <span className={styles.sectionIcon} aria-hidden="true">→</span>
              <div>
                <p>다음 조치</p>
                <h2>Merge 전 해결 필요</h2>
              </div>
            </div>
            <p>{finding?.recommendedAction ?? "정상적으로 리뷰하고, 프로젝트 검사가 통과하면 merge하세요."}</p>
          </section>

          <section className={styles.evidenceCard} aria-labelledby="evidence-heading">
            <div className={styles.evidenceHeader}>
              <div>
                <p>소스 기록</p>
                <h2 id="evidence-heading">검증된 근거</h2>
              </div>
              <span><span aria-hidden="true">✓</span> 정확한 인용문 검증됨</span>
            </div>
            {alignment.data.findings.length ? alignment.data.findings.map((item) => (
              <article key={item.id}>
                <div className={styles.evidenceSummary}>
                  <div>
                    <strong>{item.targetNodeType ?? "context"} 근거</strong>
                    <p>{item.evidence.length}개의 불변 소스 버전</p>
                  </div>
                  <button onClick={() => toggleEvidence(item.id)} type="button">
                    {revealedEvidence.has(item.id) ? "소스 근거 숨기기" : "소스 근거 보기"}
                  </button>
                </div>
                {revealedEvidence.has(item.id) ? (
                  <div className={styles.evidenceReveal} aria-live="polite">
                    {item.evidence.map((source) => (
                      <div key={`${source.sourceVersionId}-${source.exactQuote}`}>
                        <blockquote>{source.exactQuote}</blockquote>
                        <a href={source.url} rel="noreferrer" target="_blank">원본 소스 URL 열기 <span aria-hidden="true">↗</span></a>
                        <small>소스 버전 {source.sourceVersionId.slice(0, 8)} · {source.role} · {source.verified ? "검증됨" : "미검증"}</small>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            )) : <p className={styles.emptyEvidence}>○ Aligned 결과에는 충돌 근거가 필요하지 않습니다.</p>}
          </section>

          {finding?.targetNodeId ? (
            <Link className={styles.graphLink} to={`/graph?focus=${finding.targetNodeId}`}>
              <span aria-hidden="true">⌘</span>
              <span><strong>이 Decision을 맥락에서 보기</strong><small>관련 1~2 홉 Knowledge Graph를 엽니다.</small></span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        <ContextPassportPanel alignmentId={alignment.data.id} evidence={allEvidence} />
      </div>

      <AlignmentFeedback alignmentId={alignment.data.id} />
    </div>
  );
}
