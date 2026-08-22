import { useMutation, useQuery } from "@tanstack/react-query";

import { listRepositories, pollJob, startInitialSync } from "../shared/api/client";
import type { JobStatus } from "../shared/types/api";

const terminalStatuses = new Set<JobStatus>(["completed", "failed"]);

export function useRepositories(enabled = true) {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: ({ signal }) => listRepositories(signal),
    enabled,
  });
}

export function useInitialSync() {
  return useMutation({ mutationFn: startInitialSync });
}

export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: ({ signal }) => pollJob(jobId!, signal),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const job = query.state.data;
      if (job && terminalStatuses.has(job.status)) return false;
      return query.state.dataUpdateCount < 15 ? 2_000 : 5_000;
    },
  });
}
