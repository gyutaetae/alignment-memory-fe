import { type FormEvent, useState } from "react";

import type { Handshake, Override } from "../shared/types/api";
import { useHandshake, useOverride } from "./api";
import styles from "./AlignmentFeedback.module.css";

const handshakeOptions: Array<{ value: Handshake["response"]; label: string; help: string }> = [
  { value: "agree", label: "동의", help: "기록된 방향을 이해하고 지지합니다." },
  { value: "needs_clarification", label: "확인 필요", help: "정렬하기 전에 더 많은 맥락이 필요합니다." },
  { value: "disagree", label: "반대", help: "이 변경에 대한 나의 입장이 다릅니다." },
];

export function AlignmentFeedback({
  alignmentId,
  sourceLanguage,
}: {
  alignmentId: string;
  sourceLanguage: string;
}) {
  const [response, setResponse] = useState<Handshake["response"]>("agree");
  const [message, setMessage] = useState("");
  const [overrideType, setOverrideType] = useState<Override["overrideType"]>("false_positive");
  const [reason, setReason] = useState("");
  const [handshakeSaved, setHandshakeSaved] = useState(false);
  const [overrideSaved, setOverrideSaved] = useState(false);
  const handshake = useHandshake(alignmentId);
  const override = useOverride(alignmentId);

  const submitHandshake = async (event: FormEvent) => {
    event.preventDefault();
    setHandshakeSaved(false);
    await handshake.mutateAsync({ response, message: message || undefined, sourceLanguage });
    setHandshakeSaved(true);
  };

  const submitOverride = async (event: FormEvent) => {
    event.preventDefault();
    setOverrideSaved(false);
    await override.mutateAsync({ overrideType, reason, targetType: "alignment" });
    setOverrideSaved(true);
  };

  return (
    <section className={styles.feedback} aria-label="Alignment responses">
      <form className={styles.form} onSubmit={(event) => void submitHandshake(event)}>
        <div className={styles.formHeader}>
          <span className={styles.formIcon} aria-hidden="true">↔</span>
          <div>
            <p>팀 응답</p>
            <h2>Handshake</h2>
          </div>
        </div>
        <p className={styles.description}>공유된 맥락에 동의하는지 기록합니다. AI 판정을 변경하지 않습니다.</p>
        <fieldset>
          <legend>Handshake 응답</legend>
          {handshakeOptions.map((option) => (
            <label key={option.value}>
              <input
                checked={response === option.value}
                name="handshake"
                onChange={() => setResponse(option.value)}
                type="radio"
                value={option.value}
              />
              <span><strong>{option.label}</strong><small>{option.help}</small></span>
            </label>
          ))}
        </fieldset>
        <label className={styles.field}>
          <span>메모 (선택)</span>
          <textarea onChange={(event) => setMessage(event.target.value)} rows={3} value={message} />
        </label>
        {handshake.isError ? <p className={styles.error} role="alert">! {handshake.error.message}</p> : null}
        {handshakeSaved ? <p className={styles.success} role="status">✓ Handshake가 추가 전용 근거로 기록되었습니다.</p> : null}
        <button className={styles.primary} disabled={handshake.isPending} type="submit">
          {handshake.isPending ? "기록 중…" : "Handshake 기록"}
        </button>
      </form>

      <form className={`${styles.form} ${styles.overrideForm}`} onSubmit={(event) => void submitOverride(event)}>
        <div className={styles.formHeader}>
          <span className={styles.formIcon} aria-hidden="true">!</span>
          <div>
            <p>사람의 교정</p>
            <h2>Override</h2>
          </div>
        </div>
        <p className={styles.description}>판정을 교정하거나 기존 결정을 대체합니다. 이전 판정은 기록에 유지되며, 사유가 필수입니다.</p>
        <label className={styles.field}>
          <span>Override 유형</span>
          <select onChange={(event) => setOverrideType(event.target.value as Override["overrideType"])} value={overrideType}>
            <option value="false_positive">False positive (오판)</option>
            <option value="supersede_decision">Decision 대체</option>
            <option value="insufficient_evidence">근거 부족</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Override 사유 <strong>필수</strong></span>
          <textarea onChange={(event) => setReason(event.target.value)} required rows={5} value={reason} />
        </label>
        {override.isError ? <p className={styles.error} role="alert">! {override.error.message}</p> : null}
        {overrideSaved ? <p className={styles.success} role="status">✓ Override가 기존 근거를 삭제하지 않고 기록되었습니다.</p> : null}
        <button className={styles.secondary} disabled={override.isPending || !reason.trim()} type="submit">
          {override.isPending ? "기록 중…" : "Override 제출"}
        </button>
      </form>
    </section>
  );
}
