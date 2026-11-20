import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

export const CategoryTabs = ({ value, onChange, cats, allowAll = true }) => {
  const { t } = useLang();
  const opts = allowAll ? ["all", ...cats] : cats;
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((c) => (
        <button key={c} onClick={() => onChange(c)} data-testid={`category-tab-${c}`}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${value === c ? "bg-amber-500 text-stone-950" : "border border-stone-700 text-stone-300 hover:border-amber-500/60"}`}>
          {c === "all" ? t("all") : t(`cat_${c}`)}
        </button>
      ))}
    </div>
  );
};

export default function Shop() {
  const { t } = useLang();
  const { catalog, cart, addToCart, updateCart } = useApp();
  const [cat, setCat] = useState("all");
  const inCart = new Set(cart.map((i) => i.product_id));
  const toggle = (p) => (inCart.has(p.id) ? updateCart(cart.filter((i) => i.product_id !== p.id)) : addToCart([p.id]));
  const list = catalog.products.filter((p) => cat === "all" || p.category === cat);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold text-amber-50 sm:text-5xl">{t("shop_title")}</h1>
      <p className="mt-2 text-sm text-stone-400">{t("shop_sub")}</p>
      <div className="mt-6"><CategoryTabs value={cat} onChange={setCat} cats={catalog.categories} /></div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} p={p} selected={inCart.has(p.id)} onToggle={toggle} />)}
      </div>
    </div>
  );
}
