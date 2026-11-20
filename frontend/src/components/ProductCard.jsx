import { Check, Plus } from "lucide-react";
import { useLang, money } from "@/lib/i18n";

export const ProductCard = ({ p, selected, onToggle, actionLabel }) => {
  const { t, lang } = useLang();
  return (
    <div data-testid={`product-card-${p.id}`}
      className={`group overflow-hidden rounded-xl border bg-stone-900 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 ${selected ? "border-amber-500 ember-glow" : "border-stone-800 hover:border-stone-600"}`}>
      <div className="aspect-[4/3] overflow-hidden">
        <img src={p.image} alt={p.name[lang]} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t(`cat_${p.category}`)}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug text-stone-100">{p.name[lang]}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-stone-400">{p.description[lang]}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-semibold text-amber-300" data-testid={`product-price-${p.id}`}>{money(p.price, lang)}</span>
          <button onClick={() => onToggle(p)} data-testid={`product-toggle-${p.id}`}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${selected ? "bg-amber-500 text-stone-950" : "border border-stone-700 text-stone-200 hover:border-amber-500"}`}>
            {selected ? <Check size={14} /> : <Plus size={14} />}
            {actionLabel || (selected ? t("added") : t("add"))}
          </button>
        </div>
      </div>
    </div>
  );
};

export const BudgetMeter = ({ total, budget }) => {
  const { t, lang } = useLang();
  const pct = Math.min(100, (total / (budget || 1)) * 100);
  const over = total > budget;
  return (
    <div data-testid="budget-meter">
      <div className="flex justify-between text-xs">
        <span className="text-stone-400">{t("budget")} {money(budget, lang)}</span>
        <span className={over ? "text-red-400" : "text-emerald-400"} data-testid="budget-status">{over ? t("over_budget") : t("within_budget")}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-800">
        <div className={`h-full transition-[width] duration-500 ${over ? "bg-red-500" : "bg-gradient-to-r from-amber-600 to-amber-400"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-right font-display text-lg text-amber-200" data-testid="budget-total">{money(total, lang)}</p>
    </div>
  );
};
