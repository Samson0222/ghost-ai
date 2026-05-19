"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { ProjectRecord } from "@/lib/projects";

type DialogType = "create" | "rename" | "delete" | null;

export function useProjectActions() {
  const router = useRouter();
  const params = useParams();

  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [projectName, setProjectName] = useState("");
  const [suffix, setSuffix] = useState(() => Math.random().toString(36).slice(2, 7));
  const [targetProject, setTargetProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const slug = projectName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const roomId = slug ? `${slug}-${suffix}` : suffix;

  function openCreate() {
    setProjectName("");
    setSuffix(Math.random().toString(36).slice(2, 7));
    setTargetProject(null);
    setActiveDialog("create");
  }

  function openRename(project: ProjectRecord) {
    setProjectName(project.name);
    setTargetProject(project);
    setActiveDialog("rename");
  }

  function openDelete(project: ProjectRecord) {
    setTargetProject(project);
    setActiveDialog("delete");
  }

  function close() {
    setActiveDialog(null);
    setIsLoading(false);
  }

  async function handleCreate() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() || "Untitled Project" }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      close();
      router.push(`/editor/${project.id}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRename() {
    if (!targetProject || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      close();
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!targetProject || isLoading) return;
    setIsLoading(true);
    const activeProjectId = Array.isArray(params?.projectId)
      ? params.projectId[0]
      : (params?.projectId as string | undefined);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      close();
      if (activeProjectId === targetProject.id) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    activeDialog,
    projectName,
    setProjectName,
    roomId,
    targetProject,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    handleCreate,
    handleRename,
    handleDelete,
  };
}
