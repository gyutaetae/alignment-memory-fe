import { useQuery } from "@tanstack/react-query";

import { ApiClientError, generateContextPassport, getContextPassport } from "../shared/api/client";

export function useContextPassport(alignmentId: string, language: string) {
  return useQuery({
    queryKey: ["alignments", alignmentId, "context-passport", language],
    queryFn: async ({ signal }) => {
      try {
        return await getContextPassport(alignmentId, language, signal);
      } catch (error) {
        if (error instanceof ApiClientError && error.code === "context_passport_not_found") {
          return generateContextPassport(alignmentId, language);
        }
        throw error;
      }
    },
  });
}
