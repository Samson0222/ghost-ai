import Link from "next/link";
import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle">
          <Lock className="h-6 w-6 text-copy-muted" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-medium text-copy-primary">Access denied</h1>
          <p className="max-w-xs text-sm text-copy-muted">
            This project doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
        <Link href="/editor" className="text-sm text-brand hover:underline">
          Back to editor
        </Link>
      </div>
    </div>
  );
}
