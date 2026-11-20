import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventPicker } from "@/components/EventPicker";
import { CategoryChips } from "@/pages/BuildLook";
import { useLang } from "@/lib/i18n";
import { useApp, useAuthHeaders, API } from "@/lib/appState";

const Bubble = ({ m, i }) => (
  <div className={`flex ${m.role === "player" ? "justify-end" : "justify-start"}`} data-testid={`chat-msg-${i}`}>
    <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "player" ? "bg-amber-500 text-stone-950" : "border border-stone-800 bg-stone-900 text-stone-200"}`}>
      {m.content || <span className="flicker">…</span>}
    </div>
  </div>
);

export default function Interview() {
  const { t, lang } = useLang();
  const { api, catalog, toast } = useApp();
  const authHeaders = useAuthHeaders();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState(null);
  const [iv, setIv] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [cats, setCats] = useState(["costumes", "makeup", "weapons", "camping"]);
  const [recommending, setRecommending] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs]);

  const send = async (id, userText) => {
    setStreaming(true);
    setMsgs((m) => [...m, ...(userText ? [{ role: "player", content: userText }] : []), { role: "oracle", content: "" }]);
    try {
      const res = await fetch(`${API}/interviews/${id}/message`, {
        method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ text: userText, lang }),
      });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const p of parts) {
          const d = JSON.parse(p.replace(/^data: /, ""));
          if (d.error) throw new Error(d.error);
          if (d.delta) setMsgs((m) => { const c = [...m]; c[c.length - 1] = { ...c[c.length - 1], content: c[c.length - 1].content + d.delta }; return c; });
        }
      }
    } catch { toast.error(t("error")); } finally { setStreaming(false); }
  };

  const start = async () => {
    const r = await api("post", "/interviews", { event_id: eventId });
    setIv(r);
    send(r.id, "");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || streaming) return;
    const v = text.trim();
    setText("");
    send(iv.id, v);
  };

  const recommend = async () => {
    setRecommending(true);
    try {
      const look = await api("post", `/interviews/${iv.id}/recommend`, { categories: cats, lang });
      navigate(`/looks/${look.id}`);
    } catch { toast.error(t("error")); setRecommending(false); }
  };

  const answers = msgs.filter((m) => m.role === "player").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t("flow_interview")}</p>
      <h1 className="mt-2 text-4xl font-bold text-amber-50 sm:text-5xl">{t("iv_title")}</h1>
      <p className="mt-2 text-sm text-stone-400">{t("iv_sub")}</p>
      {!iv ? (
        <div className="mt-8 space-y-5 rounded-2xl border border-stone-800 leather p-6">
          <EventPicker value={eventId} onChange={setEventId} />
          <Button className="rounded-full" onClick={start} data-testid="interview-start-btn"><Sparkles className="mr-2" size={16} />{t("start")}</Button>
        </div>
      ) : (
        <>
          <div className="mt-8 h-[52vh] space-y-3 overflow-y-auto rounded-2xl border border-stone-800 bg-stone-950/60 p-4" data-testid="interview-chat">
            {msgs.map((m, i) => <Bubble key={i} m={m} i={i} />)}
            <div ref={endRef} />
          </div>
          <form onSubmit={submit} className="mt-3 flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("iv_placeholder")} className="bg-stone-900" data-testid="interview-input" />
            <Button type="submit" disabled={streaming || !text.trim()} data-testid="interview-send-btn"><Send size={16} /></Button>
          </form>
          {answers >= 2 && (
            <div className="rise mt-6 space-y-4 rounded-2xl border border-amber-500/30 leather p-5" data-testid="interview-recommend-panel">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t("iv_cats")}</p>
              <CategoryChips cats={catalog.categories} selected={cats} onChange={setCats} testPrefix="iv-cat-chip" />
              <Button className="w-full rounded-full" disabled={recommending || streaming || !cats.length} onClick={recommend} data-testid="interview-recommend-btn">
                {recommending ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Sparkles className="mr-2" size={16} />}
                {recommending ? t("iv_recommending") : t("iv_recommend")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
