"use client";

import { useRef, useEffect } from "react";
import { Check, Copy, Loader2, X } from "lucide-react";
import { EditorDialog } from "./editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Collaborator } from "@/hooks/use-share-dialog";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
  collaborators: Collaborator[];
  isLoading: boolean;
  inviteEmail: string;
  onInviteEmailChange: (email: string) => void;
  isInviting: boolean;
  inviteError: string | null;
  onInvite: () => void;
  onRemove: (id: string) => void;
  copied: boolean;
  onCopyLink: () => void;
}

function ProjectLinkInput({ projectId, open }: { projectId: string; open: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const linkValue = typeof window !== "undefined" ? `${window.location.origin}/editor/${projectId}` : "";

  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(0, 0);
          inputRef.current.scrollLeft = 0;
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [open, linkValue]);

  return (
    <input
      ref={inputRef}
      type="text"
      readOnly
      value={linkValue}
      className="h-8 w-full min-w-0 flex-1 rounded-lg border border-border bg-subtle px-2.5 py-1 text-xs font-mono text-copy-secondary text-left text-ellipsis outline-none cursor-text transition-colors"
    />
  );
}

function getInitials(displayName: string | null, email: string): string {
  const normalizedName = displayName?.trim();
  if (normalizedName) {
    const parts = normalizedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
  }
  return email.trim().charAt(0).toUpperCase() || "?";
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  isOwner,
  collaborators,
  isLoading,
  inviteEmail,
  onInviteEmailChange,
  isInviting,
  inviteError,
  onInvite,
  onRemove,
  copied,
  onCopyLink,
}: ShareDialogProps) {
  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share"
      description={`Invite people to collaborate on "${projectName}".`}
      className="w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] overflow-hidden"
    >
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Copy link */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-copy-muted">Project link</span>
          <div className="flex items-center gap-2 overflow-hidden">
            <ProjectLinkInput projectId={projectId} open={open} />
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyLink}
              className="shrink-0 gap-1.5 text-xs"
              aria-label="Copy link"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Collaborator list */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-copy-muted">
            {collaborators.length === 0 && !isLoading
              ? "No collaborators yet"
              : `People with access (${collaborators.length})`}
          </span>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-copy-muted" />
            </div>
          ) : collaborators.length > 0 ? (
            <ScrollArea className="max-h-48">
              <div className="flex flex-col gap-1 pr-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-subtle"
                  >
                    <Avatar size="sm">
                      {collab.avatarUrl && (
                        <AvatarImage src={collab.avatarUrl} alt={collab.displayName ?? collab.email} />
                      )}
                      <AvatarFallback className="bg-elevated text-copy-secondary text-xs">
                        {getInitials(collab.displayName, collab.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      {collab.displayName && (
                        <span className="truncate text-xs font-medium text-copy-primary">
                          {collab.displayName}
                        </span>
                      )}
                      <span className="truncate text-xs text-copy-muted">{collab.email}</span>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemove(collab.id)}
                        className="shrink-0 text-copy-muted hover:text-destructive"
                        aria-label={`Remove ${collab.displayName ?? collab.email}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : null}
        </div>

        {/* Invite form — owner only */}
        {isOwner && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-copy-muted">Add people</span>
            <div className="flex min-w-0 gap-2">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => onInviteEmailChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === "Enter" && !isInviting && inviteEmail.trim()) {
                    e.preventDefault();
                    onInvite();
                  }
                }}
                className="flex-1 text-sm [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#1e1e23_inset_!important] [&:-webkit-autofill]:[-webkit-text-fill-color:#f0f0f4_!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s_!important] [&:-webkit-autofill:hover]:[-webkit-box-shadow:0_0_0_1000px_#1e1e23_inset_!important] [&:-webkit-autofill:hover]:[transition:background-color_9999s_ease-in-out_0s_!important] [&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0_1000px_#1e1e23_inset_!important] [&:-webkit-autofill:focus]:[transition:background-color_9999s_ease-in-out_0s_!important] [&:-webkit-autofill:active]:[-webkit-box-shadow:0_0_0_1000px_#1e1e23_inset_!important] [&:-webkit-autofill:active]:[transition:background-color_9999s_ease-in-out_0s_!important]"
                disabled={isInviting}
              />
              <Button
                size="sm"
                onClick={onInvite}
                disabled={!inviteEmail.trim() || isInviting}
                className="shrink-0"
              >
                {isInviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Invite"}
              </Button>
            </div>
            {inviteError && (
              <p className="text-xs text-error">{inviteError}</p>
            )}
          </div>
        )}
      </div>
    </EditorDialog>
  );
}
