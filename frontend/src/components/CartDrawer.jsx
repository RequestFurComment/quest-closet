import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLang, money } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

export const CartDrawer = () => {
  const { t, lang } = useLang();
  const { cart, byId, updateCart, cartOpen, setCartOpen } = useApp();
  const navigate = useNavigate();
  const total = cart.reduce((s, i) => s + (byId[i.product_id]?.price || 0) * i.qty, 0);
  const setQty = (id, qty) => updateCart(qty < 1 ? cart.filter((i) => i.product_id !== id) : cart.map((i) => (i.product_id === id ? { ...i, qty } : i)));

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col border-stone-800 bg-stone-950 sm:max-w-md" data-testid="cart-drawer">
        <SheetHeader><SheetTitle className="font-display text-amber-100">{t("cart")}</SheetTitle></SheetHeader>
        <div className="-mx-2 flex-1 space-y-3 overflow-y-auto px-2 py-4">
          {cart.length === 0 && <p className="text-sm text-stone-400" data-testid="cart-empty">{t("cart_empty")}</p>}
          {cart.map((i) => {
            const p = byId[i.product_id];
            if (!p) return null;
            return (
              <div key={i.product_id} className="flex gap-3 rounded-lg border border-stone-800 bg-stone-900 p-2" data-testid={`cart-item-${p.id}`}>
                <img src={p.image} alt="" className="h-16 w-16 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-100">{p.name[lang]}</p>
                  <p className="text-xs text-amber-400">{money(p.price, lang)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button data-testid={`cart-dec-${p.id}`} onClick={() => setQty(p.id, i.qty - 1)} className="rounded border border-stone-700 p-1"><Minus size={12} /></button>
                    <span className="text-sm" data-testid={`cart-qty-${p.id}`}>{i.qty}</span>
                    <button data-testid={`cart-inc-${p.id}`} onClick={() => setQty(p.id, i.qty + 1)} className="rounded border border-stone-700 p-1"><Plus size={12} /></button>
                    <button data-testid={`cart-remove-${p.id}`} onClick={() => setQty(p.id, 0)} className="ml-auto text-stone-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-stone-800 pt-4">
          <div className="flex justify-between text-sm"><span className="text-stone-400">{t("subtotal")}</span>
            <span className="font-semibold text-amber-300" data-testid="cart-subtotal">{money(total, lang)}</span></div>
          <p className="mt-1 text-xs text-stone-500">{t("taxes_note")}</p>
          <Button data-testid="cart-checkout-btn" disabled={!cart.length} className="mt-4 w-full rounded-full"
            onClick={() => { setCartOpen(false); navigate("/checkout"); }}>{t("checkout")}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
