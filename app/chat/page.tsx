"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { v4 as uuidv4 } from "uuid";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useApiKey } from "@/hooks/use-api-key";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DEFAULT_MODEL, getModelDescription, getModelOptionLabel, MODEL_OPTIONS } from "@/lib/models";
import { ChatMessage, ChatSession, Reference, UserPreferences } from "@/types";

const defaultPreferences: UserPreferences = {
  defaultModel: DEFAULT_MODEL,
  editorModel: DEFAULT_MODEL,
  theme: "system",
  language: "zh-CN",
};

function toPlainContent(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function sameChatMessages(a: ChatMessage[], b: ChatMessage[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].id !== b[i].id) return false;
    if (a[i].role !== b[i].role) return false;
    if (a[i].content !== b[i].content) return false;
  }
  return true;
}

export default function ChatPage() {
  const { apiKey, status } = useApiKey();
  const { value: preferences } = useLocalStorage<UserPreferences>("preferences", defaultPreferences);
  const { value: sessions, setValue: setSessions } = useLocalStorage<ChatSession[]>("chat-sessions", []);
  const { value: savedReferences } = useLocalStorage<Reference[]>("references", []);
  const [activeId, setActiveId] = useState<string>("");
  const [model, setModel] = useState(preferences.defaultModel || DEFAULT_MODEL);
  const [customModel, setCustomModel] = useState(preferences.defaultModel || DEFAULT_MODEL);
  const [input, setInput] = useState("");
  const referencesContext = useMemo(() => {
    const verified = savedReferences.filter((r) => r.verified);
    if (!verified.length) return "";
    return verified
      .map((r) => `- ${r.authors} (${r.year}). ${r.title}. ${r.journal}.${r.doi ? ` DOI: ${r.doi}` : ""}`)
      .join("\n");
  }, [savedReferences]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { apiKey, model, references: referencesContext },
      }),
    [apiKey, model, referencesContext]
  );
  const chatId = `${activeId || "default"}:${model}:${apiKey ? "configured" : "missing"}`;
  const { messages, setMessages, sendMessage, stop, status: chatStatus } = useChat({
    id: chatId,
    transport,
  });
  const hydratedSessionIdRef = useRef<string>("");
  const isLoading = chatStatus === "submitted" || chatStatus === "streaming";

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? null,
    [activeId, sessions]
  );

  useEffect(() => {
    if (!sessions.length) {
      const id = uuidv4();
      const initial: ChatSession = {
        id,
        title: "新对话",
        model,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions([initial]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(id);
      return;
    }
    if (!activeId) {
      setActiveId(sessions[0].id);
    }
  }, [activeId, model, sessions, setSessions]);

  useEffect(() => {
    if (!activeSession) return;
    if (hydratedSessionIdRef.current === activeSession.id) return;
    hydratedSessionIdRef.current = activeSession.id;

    setMessages(
      activeSession.messages.map(
        (m) =>
          ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          } as UIMessage)
      )
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModel(activeSession.model || model);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCustomModel(activeSession.model || model);
  }, [activeSession, model, setMessages]);

  useEffect(() => {
    if (!activeId) return;
    const normalizedMessages: ChatMessage[] = messages
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: toPlainContent(m),
        createdAt: Date.now(),
      }))
      .filter((m) => m.content.trim().length > 0);

    setSessions((prev) => {
      let changed = false;
      const next = prev.map((session) => {
        if (session.id !== activeId) return session;
        const nextTitle =
          session.title === "新对话" && normalizedMessages[0]
            ? normalizedMessages[0].content.slice(0, 18)
            : session.title;
        const messagesChanged = !sameChatMessages(session.messages, normalizedMessages);
        const modelChanged = session.model !== model;
        const titleChanged = session.title !== nextTitle;
        if (!messagesChanged && !modelChanged && !titleChanged) {
          return session;
        }

        changed = true;
        return {
          ...session,
          model,
          title: nextTitle,
          messages: normalizedMessages,
          updatedAt: Date.now(),
        };
      });
      return changed ? next : prev;
    });
  }, [activeId, messages, model, setSessions]);

  function createSession() {
    const id = uuidv4();
    const next: ChatSession = {
      id,
      title: "新对话",
      model,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [next, ...prev]);
    setActiveId(id);
    hydratedSessionIdRef.current = id;
    setMessages([]);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || !activeId || isLoading) return;
    setInput("");
    await sendMessage({ text: content });
  }

  if (status !== "configured") {
    return (
      <Card>
        <p className="text-sm">
          尚未配置 API Key。请先前往 <a href="/settings" className="underline">设置页面</a> 完成配置。
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Card className="min-w-0 space-y-3">
        <Button onClick={createSession}>新建对话</Button>
        <Select
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            setCustomModel(e.target.value);
          }}
          options={MODEL_OPTIONS.map((m) => ({ label: getModelOptionLabel(m), value: m.value }))}
        />
        <p className="text-xs text-slate-600 dark:text-slate-300">擅长：{getModelDescription(model)}</p>
        <div className="space-y-2">
          <Input
            value={customModel}
            onChange={(event) => setCustomModel(event.target.value)}
            placeholder="输入 OpenRouter 模型 ID，如 openai/gpt-4.1"
          />
          <Button
            variant="outline"
            onClick={() => {
              const next = customModel.trim();
              if (!next) return;
              setModel(next);
            }}
          >
            使用自定义模型
          </Button>
        </div>
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                activeId === session.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
              onClick={() => setActiveId(session.id)}
              type="button"
            >
              {session.title}
            </button>
          ))}
        </div>
      </Card>

      <div className="min-w-0 space-y-4">
        <ChatMessages
          messages={messages.map((m) => ({ id: m.id, role: m.role, content: toPlainContent(m) }))}
          hasReferences={savedReferences.filter((r) => r.verified).length > 0}
        />
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={onSubmit}
          loading={isLoading}
          onStop={stop}
        />
      </div>
    </div>
  );
}
