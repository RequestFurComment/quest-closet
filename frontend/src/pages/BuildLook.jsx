import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard, BudgetMeter } from "@/components/ProductCard";
import { EventPicker } from "@/components/EventPicker";
import { useLang, money } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

export const CategoryChips = ({ cats, selected, onChange, testPrefix = "cat-chip" }) => {
  const { t } = useLang();
  const toggle = (c) => onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);
  return (
    <div className="flex flex-wrap gap-2">
      {cats.map((c) => (
        <button key={c} onClick={() => toggle(c)} data-testid={`${testPrefix}-${c}`}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${selected.includes(c) ? "bg-amber-500 text-stone-950" : "border border-stone-700 text-stone-300 hover:border-amber-500/60"}`}>
          {t(`cat_${c}`)}
        </button>
      ))}
    </div>
  );
};

export default function BuildLook() {
  const { t, lang } = useLang();
  const { api, catalog, byId, profile, toast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [eventId, setEventId] = useState(params.get("event"));
  const [cats, setCats] = useState(["costumes", "makeup", "weapons", "camping"]);
  const [sel, setSel] = useState([]);
  const [busy, setBusy] = useState(false);

  const toggle = (p) => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]));
  const total = sel.reduce((s, id) => s + (byId[id]?.price || 0), 0);

  const create = async () => {
    setBusy(true);
    try {
      const look = await api("post", "/looks", { flow: "build", event_id: eventId, item_ids: sel });
      if (profile?.selfie_path) await api("post", `/looks/${look.id}/preview`);
      navigate(`/looks/${look.id}`);
    } catch { toast.error(t("error")); setBusy(false); }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t("flow_build")}</p>
        <h1 className="mt-2 text-4xl font-bold text-amber-50 sm:text-5xl">{t("build_title")}</h1>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <EventPicker value={eventId} onChange={setEventId} />
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t("build_cats")}</p>
            <CategoryChips cats={catalog.categories} selected={cats} onChange={setCats} />
          </div>
        </div>
        {cats.map((c) => (
          <section key={c} className="mt-10">
            <h2 className="text-2xl font-semibold text-amber-100">{t(`cat_${c}`)}</h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.products.filter((p) => p.category === c).map((p) => <ProductCard key={p.id} p={p} selected={sel.includes(p.id)} onToggle={toggle} />)}
            </div>
          </section>
        ))}
      </div>
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="rounded-2xl border border-stone-800 leather p-5" data-testid="build-selection-panel">
          <h3 className="text-lg text-amber-100">{t("build_selected")}</h3>
          {sel.length === 0 && <p className="mt-3 text-sm text-stone-500">{t("build_none")}</p>}
          <ul className="mt-3 space-y-2">
            {sel.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm" data-testid={`build-selected-${id}`}>
                <span className="flex-1 truncate text-stone-200">{byId[id]?.name[lang]}</span>
                <span className="text-amber-300">{money(byId[id]?.price, lang)}</span>
                <button onClick={() => setSel((s) => s.filter((x) => x !== id))} className="text-stone-500 hover:text-red-400"><X size={14} /></button>
              </li>
            ))}
          </ul>
          <div className="mt-5"><BudgetMeter total={total} budget={profile?.budget || 400} /></div>
          {!profile?.selfie_path && <p className="mt-3 text-xs text-amber-300/80" data-testid="selfie-needed-note">{t("selfie_needed")}</p>}
          <Button className="mt-4 w-full rounded-full" disabled={!sel.length || busy} onClick={create} data-testid="generate-ai-preview-btn">
            {busy ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Wand2 className="mr-2" size={16} />}{busy ? t("creating") : t("create_look")}
          </Button>
        </div>
      </aside>
      {sel.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-stone-800 bg-stone-950/95 px-4 py-3 backdrop-blur-xl lg:hidden" data-testid="build-mobile-bar">
          <div className="flex-1 text-sm"><span className="text-stone-400">{sel.length} · </span>
            <span className={total > (profile?.budget || 400) ? "text-red-400" : "text-amber-300"}>{money(total, lang)}</span></div>
          <Button className="rounded-full" disabled={busy} onClick={create} data-testid="build-mobile-create-btn">
            {busy ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Wand2 className="mr-2" size={16} />}{t("create_look")}
          </Button>
        </div>
      )}
    </div>
  );
}
