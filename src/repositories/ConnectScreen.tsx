import { useState } from "react";

import { GitHubLoginPanel } from "../auth/GitHubLoginPanel";
import { isFixtureMode } from "../shared/api/client";
import { AsyncState } from "../shared/components/AsyncState";
import { StatusBadge } from "../shared/components/StatusBadge";
import { useInitialSync, useJob, useRepositories } from "./api";
import styles from "./ConnectScreen.module.css";

export function ConnectScreen() {
  const [connected, setConnected] = useState(() =>
    isFixtureMode ? false : Boolean(window.sessionStorage.getItem("alignment-memory-access-token")),
  );
  const [installed, setInstalled] = useState(false);
  const [repositoryId, setRepositoryId] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const repositories = useRepositories();
  const sync = useInitialSync();
  const job = useJob(jobId);

  if (repositories.isPending) {
    return <AsyncState kind="loading" title="연결 상태 확인 중" message="GitHub 저장소 및 설치 접근 권한을 확인하고 있습니다." />;
  }
  if (repositories.isError) {
    return (
      <AsyncState
        actionLabel="다시 시도"
        kind="error"
        message="저장소 접근 정보를 불러올 수 없습니다. 다시 연결하거나 재시도해주세요."
        onAction={() => void repositories.refetch()}
        title="연결 확인 실패"
      />
    );
  }

  const available = repositories.data.repositories;
  const selectedRepositoryId = repositoryId || available[0]?.id || "";

  const handleSync = async () => {
    if (!selectedRepositoryId) return;
    const created = await sync.mutateAsync(selectedRepositoryId);
    setJobId(created.jobId);
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <p>저장소 설정</p>
        <h1>프로젝트 메모리 연결</h1>
        <span>하나의 저장소를 인증하고, 근거 기반 지식의 첫 번째 리비전을 생성합니다.</span>
      </header>

      <div className={styles.steps}>
        <GitHubLoginPanel connected={connected} onFixtureConnect={() => setConnected(true)} />

        <section className={`${styles.stepCard} ${!connected ? styles.disabled : ""}`}>
          <div className={styles.stepCopy}>
            <span className={styles.stepIcon} aria-hidden="true">2</span>
            <div>
              <h2>GitHub App 설치</h2>
              <p>선택한 저장소에 읽기 및 workflow dispatch 접근 권한을 부여합니다.</p>
            </div>
          </div>
          {installed ? (
            <span className={styles.complete}><span aria-hidden="true">✓</span> App 설치 완료</span>
          ) : (
            <button disabled={!connected} onClick={() => setInstalled(true)} type="button">
              GitHub App 설치
            </button>
          )}
        </section>

        <section className={`${styles.stepCard} ${!installed ? styles.disabled : ""}`}>
          <div className={styles.stepCopy}>
            <span className={styles.stepIcon} aria-hidden="true">3</span>
            <div>
              <h2>저장소 선택</h2>
              <p>MVP는 하나의 공개 저장소를 명시적 제품 경계로 유지합니다.</p>
            </div>
          </div>
          {available.length ? (
            <label className={styles.selectLabel}>
              <span>저장소</span>
              <select
                disabled={!installed}
                onChange={(event) => setRepositoryId(event.target.value)}
                value={selectedRepositoryId}
              >
                {available.map((repository) => (
                  <option key={repository.id} value={repository.id}>{repository.fullName}</option>
                ))}
              </select>
            </label>
          ) : (
            <p className={styles.empty}>○ 설치된 저장소가 없습니다.</p>
          )}
        </section>

        <section className={`${styles.syncCard} ${!installed ? styles.disabled : ""}`}>
          <div className={styles.syncHeader}>
            <div className={styles.stepCopy}>
              <span className={styles.stepIcon} aria-hidden="true">4</span>
              <div>
                <h2>Initial Sync</h2>
                <p>허용된 GitHub 기록을 수집하고, 생성된 메모리가 기록될 때까지 폴링합니다.</p>
              </div>
            </div>
            <button
              disabled={!installed || !selectedRepositoryId || sync.isPending || Boolean(jobId)}
              onClick={() => void handleSync()}
              type="button"
            >
              {sync.isPending ? "시작 중…" : "Initial Sync 시작"}
            </button>
          </div>

          {sync.isError ? (
            <div className={styles.inlineError} role="alert">
              <span aria-hidden="true">!</span>
              <span>Sync를 시작할 수 없습니다. {sync.error.message}</span>
              <button onClick={() => sync.reset()} type="button">다시 시도</button>
            </div>
          ) : null}

          {job.data ? (
            <div className={styles.progressPanel} aria-live="polite">
              <div className={styles.progressMeta}>
                <StatusBadge status={job.data.status} />
                <strong>{job.data.progress}%</strong>
              </div>
              <progress max="100" value={job.data.progress}>{job.data.progress}%</progress>
              <p>작업 {job.data.jobId.slice(0, 8)}… 을 폴링 중입니다.</p>
            </div>
          ) : null}

          {job.isError ? (
            <div className={styles.inlineError} role="alert">
              <span aria-hidden="true">!</span>
              <span>진행 상태를 불러올 수 없습니다.</span>
              <button onClick={() => void job.refetch()} type="button">재시도</button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
