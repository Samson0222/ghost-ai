"use client";

import { useState } from "react";
import { MOCK_MY_PROJECTS, type Project } from "@/lib/mock-projects";

type DialogType = "create" | "rename" | "delete" | null;

export function useProjectDialogs() {
  const [myProjects, setMyProjects] = useState<Project[]>(MOCK_MY_PROJECTS);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [projectName, setProjectName] = useState("");
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const slug = projectName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  function openCreate() {
    setProjectName("");
    setTargetProject(null);
    setActiveDialog("create");
  }

  function openRename(project: Project) {
    setProjectName(project.name);
    setTargetProject(project);
    setActiveDialog("rename");
  }

  function openDelete(project: Project) {
    setTargetProject(project);
    setActiveDialog("delete");
  }

  function close() {
    setActiveDialog(null);
    setIsLoading(false);
  }

  function handleCreate() {
    if (!projectName.trim()) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectName.trim(),
      slug,
      owned: true,
    };
    setMyProjects((prev) => [...prev, newProject]);
    close();
  }

  function handleRename() {
    if (!projectName.trim() || !targetProject) return;
    setMyProjects((prev) =>
      prev.map((p) =>
        p.id === targetProject.id ? { ...p, name: projectName.trim(), slug } : p
      )
    );
    close();
  }

  function handleDelete() {
    if (!targetProject) return;
    setMyProjects((prev) => prev.filter((p) => p.id !== targetProject.id));
    close();
  }

  return {
    myProjects,
    activeDialog,
    projectName,
    setProjectName,
    slug,
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
