"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { refusalMessage } from "@/lib/devis/inbox";

/** Message of a refused Payload REST call, or the fallback. */
const errorMessage = async (response: Response, fallback: string) =>
  refusalMessage(await response.json().catch(() => null), fallback);

async function patchRequest(id: number, data: Record<string, unknown>, fallback: string): Promise<string | null> {
  const response = await fetch(`/api/devis-requests/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).catch(() => null);
  if (!response) return fallback;
  return response.ok ? null : errorMessage(response, fallback);
}

interface StatusActionsProps {
  id: number;
  /** The step that follows, with the tab it belongs to; null once the request is closed. */
  next: { status: string; label: string; tab: string } | null;
  /** Whether "lost" is still possible. */
  canLose: boolean;
  lostLabel: string;
  failed: string;
}

/** Moves a request to its next step, or closes it as lost. */
export function StatusActions({ id, next, canLose, lostLabel, failed }: StatusActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = async (status: string, tab: string) => {
    setPending(true);
    setError(null);
    const problem = await patchRequest(id, { status }, failed);
    setPending(false);
    if (problem) return setError(problem);
    // The request may have moved to another tab: follow it.
    router.push(`?tab=${tab}&id=${id}`);
    router.refresh();
  };

  if (!next && !canLose) return null;
  return (
    <div className="ws-actions">
      {next && (
        <button type="button" className="ws-button ws-button--primary" disabled={pending} onClick={() => change(next.status, next.tab)}>
          {next.label}
        </button>
      )}
      {canLose && (
        <button type="button" className="ws-button ws-button--quiet" disabled={pending} onClick={() => change("perdu", "done")}>
          {lostLabel}
        </button>
      )}
      {error && (
        <p className="ws-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface QuoteDropProps {
  id: number;
  prompt: string;
  choose: string;
  uploading: string;
  onlyPdf: string;
  failed: string;
}

/** Uploads the quote PDF (to quote-documents) and attaches it to the request. */
export function QuoteDrop({ id, prompt, choose, uploading, onlyPdf, failed }: QuoteDropProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return setError(onlyPdf);
    setPending(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const upload = await fetch("/api/quote-documents", { method: "POST", credentials: "include", body: form }).catch(() => null);
    let problem: string | null = failed;
    if (upload?.ok) {
      const { doc } = (await upload.json()) as { doc: { id: number } };
      problem = await patchRequest(id, { quote: doc.id }, failed);
    } else if (upload) {
      problem = await errorMessage(upload, failed);
    }
    setPending(false);
    if (input.current) input.current.value = "";
    if (problem) return setError(problem);
    router.refresh();
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOver(false);
    void send(event.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        className={over ? "ws-drop ws-drop--over" : "ws-drop"}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <Upload size={18} aria-hidden="true" />
        <span className="ws-drop__prompt">{pending ? uploading : prompt}</span>
        <input
          ref={input}
          type="file"
          accept="application/pdf"
          className="ws-drop__input"
          id={`quote-file-${id}`}
          disabled={pending}
          onChange={(event) => void send(event.target.files?.[0])}
        />
        <label htmlFor={`quote-file-${id}`} className="ws-button">
          {choose}
        </label>
      </div>
      {error && (
        <p className="ws-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
