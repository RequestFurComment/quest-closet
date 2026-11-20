import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeftRight, Loader2, RefreshCw, ShoppingBag, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthImage } from "@/components/AuthImage";
import { BudgetMeter } from "@/components/ProductCard";
import { useLang, money } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

const PreviewPanel = ({ look, onGenerate, hasSelfie }) => {
  const { t } = useLang();
  const st = look.preview_status;
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-stone-800 bg-stone-900" data-testid="preview-panel">
      {look.preview_path && st !== "generating" && <AuthImage path={look.preview_path} className="h-full w-full object-cover" testId="preview-image" />}
      {st === "generating" && (
        <div className="absolute inset-0 grid place-items-center bg-stone-950/80 p-6 text-center" data-testid="preview-generating">
          <div><Loader2 className="mx-auto animate-spin text-amber-400" size={36} /><p className="mt-4 text-sm text-stone-300">{t("generating")}</p></div>
        </div>
      )}
      {!look.preview_path && st !== "generating" && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            {st === "failed" && <p className="mb-3 text-sm text-red-400" data-testid="preview-failed">{t("preview_failed")}</p>}
            {!hasSelfie && <p className="mb-3 text-sm text-stone-400">{t("selfie_needed")}</p>}
            <Button className="rounded-full" disabled={!hasSelfie} onClick={onGenerate} data-testid="look-generate-preview-btn"><Wand2 className="mr-2" size={16} />{t("gen_preview")}</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const SwapDialog = ({ open, onClose, category, current, onPick }) => {
  const { t, lang } = useLang();
  const { catalog } = useApp();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-stone-800 bg-stone-950" data-testid="swap-dialog">
        <DialogHeader><DialogTitle className="font-display text-amber-100">{t("swap_title")}</DialogTitle></DialogHeader>
        <div className="grid gap-2">
          {catalog.products.filter((p) => p.category === category && !current.includes(p.id)).map((p) => (
            <button key={p.id} onClick={() => onPick(p.id)} data-testid={`swap-option-${p.id}`}
              className="flex items-center gap-3 rounded-lg border border-stone-800 p-2 text-left hover:border-amber-500/60">
              <img src={p.image} alt="" className="h-12 w-12 rounded object-cover" />
              <span className="flex-1 text-sm text-stone-200">{p.name[lang]}</span>
              <span className="text-sm text-amber-300">{money(p.price, lang)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function LookDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { api, byId, profile, addToCart, toast } = useApp();
  const [look, setLook] = useState(null);
  const [swap, setSwap] = useState(null);
  const [addCat, setAddCat] = useState(null);

  const load = useCallback(() => api("get", `/looks/${id}`).then(setLook), [api, id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (look?.preview_status !== "generating") return;
    const h = setInterval(load, 4000);
    return () => clearInterval(h);
  }, [look?.preview_status, load]);

  if (!look) return <div className="grid h-64 place-items-center"><Loader2 className="animate-spin text-amber-400" /></div>;

  const items = look.item_ids.filter((i) => byId[i]);
  const total = items.reduce((s, i) => s + byId[i].price, 0);
  const setItems = async (ids) => setLook(await api("patch", `/looks/${id}`, { item_ids: ids }));
  const generate = async () => { try { setLook(await api("post", `/looks/${id}/preview`)); } catch { toast.error(t("error")); } };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,460px)_1fr]">
      <div>
        <PreviewPanel look={look} onGenerate={generate} hasSelfie={!!profile?.selfie_path} />
        {look.preview_path && look.preview_status !== "generating" && (
          <Button variant="outline" className="mt-3 w-full rounded-full" onClick={generate} data-testid="look-regenerate-btn"><RefreshCw className="mr-2" size={16} />{t("regen")}</Button>
        )}
        <p className="mt-2 text-xs text-stone-500">{t("preview_hint")}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t(look.flow === "interview" ? "flow_interview" : "flow_build")}</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-50 sm:text-4xl" data-testid="look-title">{look.concept_name || t("look_title")}</h1>
        {look.concept_description && <p className="mt-3 text-sm text-stone-300" data-testid="look-concept">{look.concept_description}</p>}
        <h2 className="mt-8 text-xl text-amber-100">{t("gear_list")}</h2>
        <ul className="mt-4 space-y-3" data-testid="gear-list">
          {items.map((pid) => {
            const p = byId[pid];
            return (
              <li key={pid} className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 p-3" data-testid={`gear-item-${pid}`}>
                <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/80">{t(`cat_${p.category}`)}</p>
                  <p className="truncate text-sm font-medium text-stone-100">{p.name[lang]}</p>
                  {look.reasons?.[pid] && <p className="text-xs text-stone-400">{look.reasons[pid]}</p>}
                </div>
                <span className="text-sm text-amber-300">{money(p.price, lang)}</span>
                <button onClick={() => setSwap(pid)} className="rounded-md border border-stone-700 p-1.5 text-stone-300 hover:border-amber-500" title={t("swap")} data-testid={`gear-swap-${pid}`}><ArrowLeftRight size={14} /></button>
                <button onClick={() => setItems(items.filter((x) => x !== pid))} className="p-1.5 text-stone-500 hover:text-red-400" data-testid={`gear-remove-${pid}`}><X size={14} /></button>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {["costumes", "makeup", "weapons", "camping"].map((c) => (
            <button key={c} onClick={() => setAddCat(c)} className="rounded-full border border-dashed border-stone-700 px-3 py-1 text-xs text-stone-300 hover:border-amber-500" data-testid={`gear-add-${c}`}>+ {t(`cat_${c}`)}</button>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-stone-800 leather p-4"><BudgetMeter total={total} budget={profile?.budget || 400} /></div>
        <Button className="mt-4 w-full rounded-full" disabled={!items.length} onClick={() => addToCart(items)} data-testid="look-add-all-to-cart-btn">
          <ShoppingBag className="mr-2" size={16} />{t("add_all")}
        </Button>
      </div>
      <SwapDialog open={!!swap} onClose={() => setSwap(null)} category={swap && byId[swap]?.category} current={items}
        onPick={(nid) => { setItems(items.map((x) => (x === swap ? nid : x))); setSwap(null); }} />
      <SwapDialog open={!!addCat} onClose={() => setAddCat(null)} category={addCat} current={items}
        onPick={(nid) => { setItems([...items, nid]); setAddCat(null); }} />
    </div>
  );
}
