"use client";

import React from "react";
import type { GeneratedFormHydrationResult, RecentGeneratedForm } from "@/lib/designerWorkspace";

export function useRecentFormsRegistry() {
  const [recentForms, setRecentForms] = React.useState<RecentGeneratedForm[]>([]);
  const [isRecentFormsLoading, setIsRecentFormsLoading] = React.useState<boolean>(true);
  const [recentFormsError, setRecentFormsError] = React.useState<string | null>(null);
  const [openingRecentSlug, setOpeningRecentSlug] = React.useState<string | null>(null);

  const loadRecentForms = React.useCallback(async (signal?: AbortSignal) => {
    setIsRecentFormsLoading(true);
    setRecentFormsError(null);

    try {
      const response = await fetch("/api/generated-forms", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const result = (await response.json()) as { forms?: RecentGeneratedForm[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to load previous uploads.");
      }

      setRecentForms(result.forms ?? []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setRecentFormsError(error instanceof Error ? error.message : "Unable to load previous uploads.");
    } finally {
      if (!signal?.aborted) {
        setIsRecentFormsLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadRecentForms(controller.signal);

    return () => controller.abort();
  }, [loadRecentForms]);

  const openRecentForm = React.useCallback(async (form: RecentGeneratedForm) => {
    setOpeningRecentSlug(form.slug);
    setRecentFormsError(null);

    try {
      const response = await fetch(`/api/generated-forms/${form.slug}`, {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json()) as GeneratedFormHydrationResult & { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to load the selected form.");
      }

      return result;
    } catch (error) {
      setRecentFormsError(error instanceof Error ? error.message : "Unable to load the selected form.");
      return null;
    } finally {
      setOpeningRecentSlug(null);
    }
  }, []);

  return {
    recentForms,
    isRecentFormsLoading,
    recentFormsError,
    openingRecentSlug,
    loadRecentForms,
    openRecentForm,
    setRecentFormsError,
  };
}