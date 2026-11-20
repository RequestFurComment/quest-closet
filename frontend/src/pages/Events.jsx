import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, ExternalLink, Loader2, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/components/EventPicker";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

export default function Events() {
  const { t, lang } = useLang();
  const { api, toast } = useApp();
  const navigate = useNavigate();
  const [events, setEvents] = useEvents();
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api("post", "/events/refresh");
      setEvents(r.events);
    } catch { toast.error(t("error")); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-amber-50 sm:text-5xl">{t("ev_title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-400">{t("ev_sub")}</p>
        </div>
        <Button onClick={refresh} disabled={loading} variant="outline" className="rounded-full border-amber-500/50" data-testid="events-ai-refresh-btn">
          {loading ? <Loader2 className="mr-2 animate-spin" size={16} /> : <RefreshCw className="mr-2" size={16} />}
          {loading ? t("ev_refreshing") : t("ev_refresh")}
        </Button>
      </div>
      <p className="mt-4 text-xs text-stone-500">{t("ev_disclaimer")}</p>
      {events.length === 0 && <p className="mt-10 text-stone-400" data-testid="events-empty">{t("ev_empty")}</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((e, i) => (
          <article key={e.id} className="rise flex flex-col rounded-xl border border-stone-800 leather p-5" style={{ animationDelay: `${i * 40}ms` }} data-testid={`event-card-${e.id}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-blue-900/60 px-2.5 py-0.5 text-[11px] font-semibold text-blue-200">{e[`genre_${lang}`]}</span>
              <span className="text-xs text-amber-400">{e[`dates_text_${lang}`] || e.start_date}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-amber-50">{e.name}</h3>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-300"><MapPin size={14} className="text-amber-500" />{e.location}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400"><Car size={14} />{e.distance_km} km · {e.drive_time} {t("ev_from_mtl")}</p>
            <p className="mt-3 flex-1 text-sm text-stone-400">{e[`description_${lang}`]}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-800 pt-3 text-xs">
              {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-amber-400 hover:underline" data-testid={`event-source-${e.id}`}>{t("ev_source")} <ExternalLink size={12} /></a>}
              <span className="text-stone-500">{t("ev_checked")} {new Date(e.last_checked).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA")}</span>
              <button onClick={() => navigate(`/build?event=${e.id}`)} className="ml-auto rounded-full bg-amber-500 px-3 py-1 font-semibold text-stone-950" data-testid={`event-attach-${e.id}`}>{t("ev_attach")}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
