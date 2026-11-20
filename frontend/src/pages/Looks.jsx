import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { AuthImage } from "@/components/AuthImage";
import { useLang, money } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

export default function Looks() {
  const { t, lang } = useLang();
  const { api, byId } = useApp();
  const [looks, setLooks] = useState(null);
  useEffect(() => { api("get", "/looks").then(setLooks); }, [api]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold text-amber-50 sm:text-5xl">{t("looks_title")}</h1>
      {looks?.length === 0 && <p className="mt-8 text-stone-400" data-testid="looks-empty">{t("looks_empty")}</p>}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {looks?.map((l) => (
          <Link key={l.id} to={`/looks/${l.id}`} className="group overflow-hidden rounded-xl border border-stone-800 bg-stone-900 hover:border-amber-500/60" data-testid={`look-card-${l.id}`}>
            <div className="aspect-[3/4] overflow-hidden">
              {l.preview_path ? <AuthImage path={l.preview_path} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                : <div className="grid h-full place-items-center text-stone-600"><ImageOff /></div>}
            </div>
            <div className="p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/80">{t(l.flow === "interview" ? "flow_interview" : "flow_build")}</p>
              <p className="truncate text-sm font-medium text-stone-100">{l.concept_name || t("look_title")}</p>
              <p className="text-xs text-amber-300">{money(l.item_ids.reduce((s, i) => s + (byId[i]?.price || 0), 0), lang)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
