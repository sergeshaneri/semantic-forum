"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Message = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  fromMe: boolean;
};

type Participant = {
  id: string;
  username: string;
  name: string;
  image: string | null;
};

type Props = {
  conversationId: string;
  initialMessages: Message[];
  participants: Participant[];
  dict: Dictionary;
};

export function DmThread({
  conversationId,
  initialMessages,
  participants,
  dict,
}: Props) {
  const thread = trpc.dm.thread.useQuery(
    { conversationId },
    {
      initialData: {
        conversationId,
        participants,
        messages: initialMessages,
      },
      refetchInterval: 30_000,
      staleTime: 10_000,
    },
  );
  const send = trpc.dm.send.useMutation();
  const markRead = trpc.dm.markRead.useMutation();
  const utils = trpc.useUtils();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = thread.data?.messages ?? initialMessages;
  const participantsData = thread.data?.participants ?? participants;
  const other = participantsData[0];

  // Mark read on mount and when new messages arrive
  useEffect(() => {
    markRead.mutate({ conversationId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const text = body.trim();
    if (!text) return;
    try {
      await send.mutateAsync({ conversationId, body: text });
      setBody("");
      await utils.dm.thread.invalidate({ conversationId });
      await utils.dm.unreadCount.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <div className="flex flex-col h-[70vh] rounded-md border border-border overflow-hidden">
      {other && (
        <div className="border-b border-border bg-muted/30 px-3 py-2 text-sm flex items-center gap-2">
          {other.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={other.image}
              alt={other.name || other.username}
              className="size-7 rounded-full object-cover border border-border"
            />
          ) : (
            <span className="size-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-semibold uppercase">
              {(other.name || other.username || "u").slice(0, 2)}
            </span>
          )}
          <span className="font-medium">
            {other.name || `@${other.username}`}
          </span>
          <span className="text-xs text-muted-foreground/70 font-mono">
            @{other.username}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-background">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {dict.dm.threadEmpty}
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                  m.fromMe
                    ? "bg-foreground text-background rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                <p>{m.body}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    m.fromMe ? "text-background/60" : "text-muted-foreground/70"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-border bg-muted/20 p-2 flex items-end gap-2"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={dict.dm.typingPlaceholder}
          rows={1}
          maxLength={4000}
          className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/60 max-h-32"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          disabled={send.isPending || body.trim().length === 0}
          className="rounded-md bg-foreground text-background px-3 py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {send.isPending ? "…" : dict.dm.sendButton}
        </button>
      </form>
      {error && (
        <p className="px-3 py-1 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
