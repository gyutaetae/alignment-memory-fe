export type DemoPersonaId =
  | "toronto-backend"
  | "danang-frontend"
  | "seoul-backend"
  | "tokyo-pm";

export type CollaborationLanguage = "ko" | "en" | "ja" | "vi";

export interface DemoPersona {
  id: DemoPersonaId;
  label: string;
  timezone: string;
  role: string;
  ownership: string;
  handoff: string;
}

export const collaborationLanguages: Array<{
  id: CollaborationLanguage;
  label: string;
}> = [
  { id: "ko", label: "한국어" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
  { id: "vi", label: "Tiếng Việt" },
];

export const demoPersonas: Record<DemoPersonaId, DemoPersona> = {
  "toronto-backend": {
    id: "toronto-backend",
    label: "김규태 · Toronto",
    timezone: "America/Toronto",
    role: "Backend developer",
    ownership: "주요 기여는 팀원이 직접 작성 예정",
    handoff: "원문 근거·결정 이유·미해결 질문을 다음 작업자에게 전달",
  },
  "danang-frontend": {
    id: "danang-frontend",
    label: "모전민 · Da Nang",
    timezone: "Asia/Ho_Chi_Minh",
    role: "Frontend developer",
    ownership: "주요 기여는 팀원이 직접 작성 예정",
    handoff: "원문 근거·결정 이유·미해결 질문을 다음 작업자에게 전달",
  },
  "seoul-backend": {
    id: "seoul-backend",
    label: "김세현 · Seoul",
    timezone: "Asia/Seoul",
    role: "Backend developer",
    ownership: "주요 기여는 팀원이 직접 작성 예정",
    handoff: "원문 근거·결정 이유·미해결 질문을 다음 작업자에게 전달",
  },
  "tokyo-pm": {
    id: "tokyo-pm",
    label: "지우 · Tokyo",
    timezone: "Asia/Tokyo",
    role: "Product manager",
    ownership: "주요 기여는 팀원이 직접 작성 예정",
    handoff: "원문 근거·결정 이유·미해결 질문을 다음 작업자에게 전달",
  },
};
