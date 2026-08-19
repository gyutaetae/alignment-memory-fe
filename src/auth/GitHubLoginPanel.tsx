import { getGitHubLoginUrl, isFixtureMode } from "../shared/api/client";
import styles from "./GitHubLoginPanel.module.css";

interface GitHubLoginPanelProps {
  connected: boolean;
  onFixtureConnect: () => void;
}

export function GitHubLoginPanel({ connected, onFixtureConnect }: GitHubLoginPanelProps) {
  return (
    <div className={styles.panel}>
      <div>
        <span className={styles.stepIcon} aria-hidden="true">1</span>
        <h2>GitHub 로그인</h2>
        <p>저장소 접근 권한을 선택하기 전에 멤버 계정을 인증합니다.</p>
      </div>
      {connected ? (
        <span className={styles.connected}><span aria-hidden="true">✓</span> GitHub 연결됨</span>
      ) : isFixtureMode ? (
        <button className={styles.primary} onClick={onFixtureConnect} type="button">
          GitHub로 계속하기
        </button>
      ) : (
        <a className={styles.primary} href={getGitHubLoginUrl()}>
          GitHub로 계속하기
        </a>
      )}
    </div>
  );
}
