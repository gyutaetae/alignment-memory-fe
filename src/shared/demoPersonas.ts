export type DemoPersonaId = "seoul-pm" | "toronto-developer";

export interface DemoPersona {
  id: DemoPersonaId;
  label: string;
  language: "ko" | "en";
  languageLabel: string;
  timezone: string;
  role: string;
  ownership: string;
}

export const demoPersonas: Record<DemoPersonaId, DemoPersona> = {
  "seoul-pm": {
    id: "seoul-pm",
    label: "서울 PM",
    language: "ko",
    languageLabel: "한국어",
    timezone: "Asia/Seoul · UTC+09:00",
    role: "Product manager",
    ownership: "제품 의도와 승인 기준",
  },
  "toronto-developer": {
    id: "toronto-developer",
    label: "Toronto developer",
    language: "en",
    languageLabel: "English",
    timezone: "America/Toronto · UTC−04:00 (EDT)",
    role: "Backend developer",
    ownership: "Implementation and debugging evidence",
  },
};
