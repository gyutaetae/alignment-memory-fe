import { Link } from "react-router-dom";

import { useRepositories } from "../repositories/api";
import { AsyncState } from "../shared/components/AsyncState";
import { StatusBadge } from "../shared/components/StatusBadge";
import { useDashboardKnowledge, useProjectDashboard } from "./api";
import { orderAlignments } from "./priority";
import styles from "./ProjectMemoryScreen.module.css";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ProjectMemoryScreen() {
  const repositories = useRepositories();
  const repositoryId = repositories.data?.repositories[0]?.id;
  const dashboard = useProjectDashboard(repositoryId);
  const knowledge = useDashboardKnowledge(repositoryId);

  if (repositories.isPending || dashboard.isPending) {
    return <AsyncState kind="loading" title="프로젝트 메모리 구성 중" message="활성 결정, 충돌 내역, 최근 기록을 불러오고 있습니다." />;
  }
  if (repositories.isError || dashboard.isError) {
    return (
      <AsyncState
        actionLabel="다시 시도"
        kind="error"
        message="저장소 API에서 프로젝트 메모리를 불러올 수 없습니다."
        onAction={() => {
          void repositories.refetch();
          void dashboard.refetch();
        }}
        title="프로젝트 메모리 로드 실패"
      />
    );
  }
  if (!repositoryId || !dashboard.data) {
    return (
      <AsyncState
        actionLabel="저장소 연결"
        message="프로젝트 메모리를 구성하려면 먼저 GitHub App을 설치하고 저장소를 선택하세요."
        onAction={() => { window.location.href = "/connect"; }}
        title="연결된 저장소 없음"
      />
    );
  }

  const alignments = orderAlignments(dashboard.data.recentAlignments);
  const attention = alignments.filter((item) => item.outcome !== "aligned");
  const primaryConflict = attention[0];
  const goal = knowledge.data?.nodes.find((node) => node.nodeType === "goal");
  const decision = knowledge.data?.nodes.find((node) => node.nodeType === "decision");

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>저장소 · {dashboard.data.repository.fullName}</p>
          <h1>프로젝트 메모리</h1>
          <span>Knowledge revision {dashboard.data.repository.knowledgeRevision}</span>
        </div>
        <Link className={styles.secondaryAction} to="/connect">↻ 저장소 동기화</Link>
      </header>

      {primaryConflict ? (
        <section className={styles.priorityCard} aria-labelledby="priority-heading">
          <div className={styles.priorityCopy}>
            <StatusBadge status={primaryConflict.outcome} />
            <p className={styles.kicker}>Merge 전 조치 필요</p>
            <h2 id="priority-heading">PR #{primaryConflict.prNumber}이 활성 프로젝트 경계를 넘고 있습니다</h2>
            <p>
              기존 합의와 제안된 변경을 비교 검토한 후, Handshake를 기록하거나 근거 있는 Override를 제출하세요.
            </p>
          </div>
          <div className={styles.nextAction}>
            <span>다음 조치</span>
            <strong>Alignment Diff 열기</strong>
            <p>근거를 확인하고 팀 응답을 선택하세요.</p>
            <Link to={`/alignments/${primaryConflict.id}`}>충돌 검토하기 <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      ) : (
        <section className={styles.clearCard}>
          <StatusBadge status="aligned" />
          <h2>조치가 필요한 Alignment 이슈 없음</h2>
          <p>최근 작업이 기록된 활성 맥락과 일치합니다.</p>
        </section>
      )}

      <section className={styles.summaryGrid} aria-label="프로젝트 메모리 요약">
        <article><span>검증된 소스</span><strong>{dashboard.data.summary.sourceCount}</strong><small>불변 소스 버전</small></article>
        <article><span>Knowledge Nodes</span><strong>{dashboard.data.summary.knowledgeNodeCount}</strong><small>활성 프로젝트 맥락</small></article>
        <article><span>Alignment 검사</span><strong>{dashboard.data.summary.alignmentCount}</strong><small>기록된 분석</small></article>
        <article><span>진행 중인 작업</span><strong>{dashboard.data.summary.openJobCount}</strong><small>업데이트 폴링 중</small></article>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel} aria-labelledby="context-heading">
          <div className={styles.panelHeader}>
            <div>
              <p>현재 맥락</p>
              <h2 id="context-heading">Goal 및 Decision</h2>
            </div>
            <Link to="/graph">연결 관계 보기</Link>
          </div>
          {knowledge.isPending ? (
            <p className={styles.inlineState}>↻ 활성 지식 로딩 중…</p>
          ) : knowledge.isError ? (
            <button className={styles.retry} onClick={() => void knowledge.refetch()} type="button">! 지식 재로딩</button>
          ) : (
            <div className={styles.contextList}>
              {[goal, decision].filter(Boolean).map((node) => (
                <article key={node!.id}>
                  <span>{node!.nodeType === "goal" ? "◎ Goal" : "◇ Decision"}</span>
                  <h3>{node!.title}</h3>
                  <p>{node!.summary}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="attention-heading">
          <div className={styles.panelHeader}>
            <div>
              <p>검토 대기열</p>
              <h2 id="attention-heading">조치 필요</h2>
            </div>
            <span>{attention.length}건 대기</span>
          </div>
          {attention.length ? (
            <div className={styles.alignmentList} aria-label="Alignment 우선순위">
              {attention.map((item) => (
                <Link key={item.id} to={`/alignments/${item.id}`}>
                  <span className={styles.prNumber}>PR #{item.prNumber}</span>
                  <StatusBadge status={item.outcome} />
                  <small>{formatTime(item.createdAt)}</small>
                  <span className={styles.chevron} aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          ) : <p className={styles.inlineState}>✓ 검토가 필요한 항목이 없습니다.</p>}
        </section>

        <section className={`${styles.panel} ${styles.recentPanel}`} aria-labelledby="recent-heading">
          <div className={styles.panelHeader}>
            <div>
              <p>누적 기억</p>
              <h2 id="recent-heading">최근 기록</h2>
            </div>
            <span>최신순</span>
          </div>
          <div className={styles.timeline}>
            {dashboard.data.jobs.map((job) => (
              <article key={job.jobId}>
                <span className={styles.timelineMark} aria-hidden="true">{job.status === "completed" ? "✓" : "↻"}</span>
                <div>
                  <strong>{job.eventType === "initial_sync" ? "Initial Sync" : job.eventType === "pr_analysis" ? "PR 분석" : "Merge 발행"}</strong>
                  <p>{job.status === "completed" ? "지식과 근거가 기록되었습니다." : `Worker가 ${job.status.replace("_", " ")} 상태 — ${job.progress}% 진행.`}</p>
                </div>
                <time dateTime={job.updatedAt}>{formatTime(job.updatedAt)}</time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
