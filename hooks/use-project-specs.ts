"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectSpecListItem } from "@/lib/specs";

export function useProjectSpecs(projectId: string) {
  const [specs, setSpecs] = useState<ProjectSpecListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (!res.ok) throw new Error("Failed to load specs");
      const data = (await res.json()) as ProjectSpecListItem[];
      setSpecs(data);
    } catch {
      setError("Could not load specs.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { specs, isLoading, error, refetch };
}
