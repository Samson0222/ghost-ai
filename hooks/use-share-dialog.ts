"use client";

import { useState, useCallback } from "react";

export interface Collaborator {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export function useShareDialog(projectId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) setCollaborators(await res.json());
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  function open() {
    setIsOpen(true);
    loadCollaborators();
  }

  function close() {
    setIsOpen(false);
    setInviteEmail("");
    setInviteError(null);
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || isInviting) return;
    setIsInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteError(data.error ?? "Failed to invite");
        return;
      }
      setInviteEmail("");
      await loadCollaborators();
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    try {
      await fetch(`/api/projects/${projectId}/collaborators/${collaboratorId}`, {
        method: "DELETE",
      });
    } catch {
      await loadCollaborators();
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return {
    isOpen,
    open,
    close,
    collaborators,
    isLoading,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteError,
    handleInvite,
    handleRemove,
    copied,
    handleCopyLink,
  };
}
