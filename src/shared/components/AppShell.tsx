import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { isFixtureMode } from "../api/client";
import styles from "./AppShell.module.css";

const navigation = [
  { to: "/connect", icon: "↗", label: "연결" },
  { to: "/memory", icon: "▤", label: "프로젝트 메모리" },
  { to: "/graph", icon: "⌘", label: "Knowledge Graph" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <NavLink className={styles.brand} to="/memory">
          <span className={styles.mark} aria-hidden="true">AM</span>
          <span>
            <strong>Alignment Memory</strong>
            <small>근거 기반 프로젝트 기억 시스템</small>
          </span>
        </NavLink>
        <div className={styles.topbarMeta}>
          <span className={styles.fixture}>
            {isFixtureMode ? "◆ Fixture 데이터" : "● Live API"}
          </span>
          <span className={styles.identity} aria-label="로그인된 프로필">
            KG
          </span>
        </div>
      </header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p className={styles.navLabel}>워크스페이스</p>
          <nav aria-label="주요 내비게이션">
            {navigation.map((item) => (
              <NavLink
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
                key={item.to}
                to={item.to}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.repositoryCard}>
            <span className={styles.repositoryIcon} aria-hidden="true">⌂</span>
            <span>
              <small>활성 저장소</small>
              <strong>alignment-memory-be</strong>
            </span>
          </div>
        </aside>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
