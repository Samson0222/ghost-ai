"use client";

import { useRef, useCallback, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { BotMessageSquare, X, FileText, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
    }
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, role: "user", content: text },
    ]);
    setInput("");
    resetTextarea();
  }, [input, resetTextarea]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChip = useCallback((chip: string) => {
    setMessages([{ id: `${Date.now()}`, role: "user", content: chip }]);
  }, []);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  return (
    <aside
      className={cn(
        "fixed right-0 top-12 bottom-0 z-40 flex w-80 flex-col",
        "border-l border-border-subtle bg-surface/95 shadow-2xl backdrop-blur-sm",
        "transition-transform duration-200",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-start gap-3 border-b border-border-subtle px-4 py-3">
        <BotMessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-ai-text" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-copy-primary">AI Workspace</p>
          <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-copy-muted hover:text-copy-primary"
          onClick={onClose}
          aria-label="Close AI sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2">
          <TabsTrigger value="architect">AI Architect</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
        </TabsList>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="min-h-0 flex flex-col">
          <ScrollArea className="flex-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
                <BotMessageSquare className="h-8 w-8 text-ai-text/60" />
                <div>
                  <p className="text-sm font-medium text-copy-primary">Ghost AI Architect</p>
                  <p className="mt-1 text-xs text-copy-muted">
                    Describe your system and I&apos;ll help design the architecture.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {STARTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChip(chip)}
                      className="w-full rounded-full bg-subtle px-3 py-2 text-left text-xs text-ai-text transition-colors hover:bg-elevated"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4">
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl border-2 border-brand/50 bg-brand-dim px-3 py-2">
                        <p className="text-xs text-copy-primary">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl border border-border-subtle bg-elevated px-3 py-2">
                        <p className="text-xs text-ai-text">{msg.content}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </ScrollArea>

          <div className="shrink-0 border-t border-border-subtle p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Describe your architecture..."
                className="min-h-[72px] max-h-[160px] resize-none overflow-y-auto border-border-subtle bg-elevated text-xs text-copy-primary placeholder:text-copy-faint"
                style={{ height: "72px" }}
              />
              <Button
                size="icon"
                disabled={!input.trim()}
                onClick={handleSend}
                className="h-9 w-9 shrink-0 bg-ai text-white hover:bg-ai/90 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-col gap-4 p-4">
          <Button className="w-full bg-ai text-white hover:bg-ai/90">
            Generate Spec
          </Button>

          <div className="flex gap-3 rounded-2xl border border-border-subtle bg-elevated p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ai-text" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-copy-primary">E-commerce Architecture</p>
              <p className="mt-1 line-clamp-2 text-xs text-copy-muted">
                Microservices layout with API gateway, auth service, product catalog, and order processing pipeline.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="h-7 w-7 shrink-0 self-start text-copy-faint"
              aria-label="Download spec"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
