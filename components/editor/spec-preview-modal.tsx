"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { EditorDialog } from "./editor-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadSpecFile, specDownloadUrl } from "@/lib/specs";

const markdownComponents: ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: (props) => <h2 className="mt-4 mb-2 text-base font-semibold text-copy-primary first:mt-0" {...props} />,
  h2: (props) => <h3 className="mt-4 mb-2 text-sm font-semibold text-copy-primary first:mt-0" {...props} />,
  h3: (props) => <h4 className="mt-3 mb-1.5 text-sm font-medium text-copy-primary first:mt-0" {...props} />,
  p: (props) => <p className="mb-2 text-xs leading-relaxed text-copy-secondary" {...props} />,
  ul: (props) => <ul className="mb-2 ml-4 list-disc space-y-1 text-xs text-copy-secondary" {...props} />,
  ol: (props) => <ol className="mb-2 ml-4 list-decimal space-y-1 text-xs text-copy-secondary" {...props} />,
  li: (props) => <li className="text-xs text-copy-secondary" {...props} />,
  code: (props) => <code className="rounded bg-subtle px-1 py-0.5 font-mono text-[11px] text-ai-text" {...props} />,
  pre: (props) => <pre className="mb-2 overflow-x-auto rounded-xl bg-subtle p-3 font-mono text-[11px] text-copy-secondary" {...props} />,
  a: (props) => <a className="text-brand underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />,
  strong: (props) => <strong className="font-semibold text-copy-primary" {...props} />,
  hr: () => <hr className="my-3 border-border-subtle" />,
  blockquote: (props) => (
    <blockquote className="mb-2 border-l-2 border-border-subtle pl-3 text-xs italic text-copy-muted" {...props} />
  ),
};

interface SpecPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  specId: string | null;
  filename: string | null;
}

export function SpecPreviewModal({ open, onOpenChange, projectId, specId, filename }: SpecPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !specId) {
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(specDownloadUrl(projectId, specId))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load spec");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load spec content.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, specId, projectId]);

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title={filename ?? "Spec Preview"}
      className="w-[calc(100vw-2rem)] sm:w-[560px] max-w-[560px] overflow-hidden"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            size="sm"
            disabled={!specId}
            onClick={() => specId && filename && downloadSpecFile(projectId, specId, filename)}
            className="gap-1.5 bg-ai text-white hover:bg-ai/90"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      }
    >
      <ScrollArea className="max-h-[60vh] pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-4 w-4 animate-spin text-copy-muted" />
            <span className="text-xs text-copy-muted">Loading spec…</span>
          </div>
        ) : error ? (
          <p className="py-8 text-center text-xs text-error">{error}</p>
        ) : content ? (
          <div className="pr-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        ) : null}
      </ScrollArea>
    </EditorDialog>
  );
}
