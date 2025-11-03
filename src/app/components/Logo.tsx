import { ClipboardCopy } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="ClipEase Logo">
      <ClipboardCopy className="h-7 w-7 text-primary" />
      <h1 className="font-headline text-2xl font-bold tracking-tight">
        ClipEase
      </h1>
    </div>
  );
}
