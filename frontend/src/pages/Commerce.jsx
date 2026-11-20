import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/react";
import { CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang, money } from "@/lib/i18n";
import { useApp } from "@/lib/appState";

const QC = /^[GHJ]\d[A-Z]\s?\d[A-Z]\d$/i;

export function Checkout() {
  const { t, lang } = useLang();
  const { api, cart, byId, toast } = useApp();
  const [f, setF] = useState({ name: "", line1: "", city: "", province: "QC", postal_code: "" });
  const [busy, setBusy] = useState(false);
  const { isSignedIn } = useAuth();
  const total = cart.reduce((s, i) => s + (byId[i.product_id]?.price || 0) * i.qty, 0);
  const validPostal = QC.test(f.postal_code.trim());
  const ok = f.name.length > 1 && f.line1.length > 2 && f.city.length > 1 && validPostal;

  const pay = async () => {
    setBusy(true);
    try {
      const r = await api("post", "/checkout", { origin_url: window.location.origin, shipping: f, lang });
      window.location.href = r.checkout_url;
    } catch (e) {
      toast.error(e.response?.data?.detail === "quebec_only" ? t("co_quebec_only") : t("error"));
      setBusy(false);
    }
  };

  const field = (k, label, props = {}) => (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5 bg-stone-950" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} data-testid={`checkout-${k}-input`} {...props} />
    </div>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-4xl font-bold text-amber-50">{t("co_title")}</h1>
        <div className="mt-6 space-y-4 rounded-2xl border border-stone-800 leather p-6">
          <h2 className="text-lg text-amber-100">{t("co_ship")}</h2>
          {field("name", t("co_name"))}
          {field("line1", t("co_line1"))}
          <div className="grid gap-4 sm:grid-cols-3">
            {field("city", t("co_city"))}
            {field("province", t("co_province"), { disabled: true })}
            {field("postal_code", t("co_postal"), { placeholder: "H2X 1Y4" })}
          </div>
          {f.postal_code && !validPostal && <p className="text-xs text-red-400" data-testid="checkout-quebec-error">{t("co_quebec_only")}</p>}
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200" data-testid="checkout-test-note">{t("co_test")}</p>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-stone-800 bg-stone-900 p-5">
        <ul className="space-y-2 text-sm">
          {cart.map((i) => (
            <li key={i.product_id} className="flex justify-between gap-2"><span className="truncate text-stone-300">{i.qty} × {byId[i.product_id]?.name[lang]}</span>
              <span className="text-stone-200">{money((byId[i.product_id]?.price || 0) * i.qty, lang)}</span></li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-stone-800 pt-3"><span className="text-stone-400">{t("subtotal")}</span>
          <span className="font-semibold text-amber-300" data-testid="checkout-subtotal">{money(total, lang)}</span></div>
        <p className="mt-1 text-xs text-stone-500">{t("taxes_note")}</p>
        {isSignedIn ? (
          <Button className="mt-5 w-full rounded-full" disabled={!ok || !cart.length || busy} onClick={pay} data-testid="stripe-checkout-btn">
            {busy ? <Loader2 className="mr-2 animate-spin" size={16} /> : <CreditCard className="mr-2" size={16} />}{t("co_pay")}
          </Button>
        ) : (
          <div className="mt-5" data-testid="checkout-signin-required">
            <p className="mb-3 text-xs text-amber-200">{t("co_signin")}</p>
            <SignIn routing="hash" forceRedirectUrl="/checkout" signUpForceRedirectUrl="/checkout"
              appearance={{ elements: { rootBox: "w-full", cardBox: "w-full max-w-full shadow-none", card: "px-4" } }} />
          </div>
        )}
      </aside>
    </div>
  );
}

export function PaymentSuccess() {
  const { t } = useLang();
  const { api, refreshCart } = useApp();
  const [params] = useSearchParams();
  const sid = params.get("session_id");
  const [state, setState] = useState("checking");
  const tries = useRef(0);

  useEffect(() => {
    let h;
    const poll = async () => {
      try {
        const r = await api("get", `/payments/status/${sid}`);
        if (r.payment_status === "paid") { setState("paid"); refreshCart(); return; }
        if (["expired", "failed"].includes(r.payment_status)) return setState("failed");
      } catch {}
      if (++tries.current > 15) return setState("failed");
      h = setTimeout(poll, 2000);
    };
    poll();
    return () => clearTimeout(h);
  }, [sid, api, refreshCart]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center" data-testid="payment-success-page">
      {state === "checking" && <><Loader2 className="mx-auto animate-spin text-amber-400" size={40} /><p className="mt-4 text-stone-300">{t("pay_checking")}</p></>}
      {state === "paid" && <>
        <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
        <h1 className="mt-4 text-3xl font-bold text-amber-50" data-testid="payment-success-title">{t("pay_success")}</h1>
        <p className="mt-2 text-stone-400">{t("pay_success_sub")}</p>
        <Link to="/orders" className="mt-8 inline-block rounded-full bg-amber-500 px-6 py-2.5 font-semibold text-stone-950" data-testid="view-orders-btn">{t("view_orders")}</Link>
      </>}
      {state === "failed" && <><XCircle className="mx-auto text-red-400" size={48} /><p className="mt-4 text-stone-300" data-testid="payment-failed">{t("pay_failed")}</p></>}
    </div>
  );
}

export function PaymentCancel() {
  const { t } = useLang();
  const { setCartOpen } = useApp();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center" data-testid="payment-cancel-page">
      <XCircle className="mx-auto text-stone-500" size={48} />
      <h1 className="mt-4 text-3xl font-bold text-amber-50">{t("pay_cancel")}</h1>
      <p className="mt-2 text-stone-400">{t("pay_cancel_sub")}</p>
      <Button className="mt-8 rounded-full" onClick={() => { navigate("/shop"); setCartOpen(true); }} data-testid="back-to-cart-btn">{t("back_cart")}</Button>
    </div>
  );
}

export function Orders() {
  const { t, lang } = useLang();
  const { api, byId } = useApp();
  const [orders, setOrders] = useState(null);
  useEffect(() => { api("get", "/orders").then(setOrders); }, [api]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold text-amber-50">{t("orders_title")}</h1>
      {orders?.length === 0 && <p className="mt-8 text-stone-400" data-testid="orders-empty">{t("orders_empty")}</p>}
      <div className="mt-8 space-y-4">
        {orders?.map((o) => (
          <div key={o.session_id} className="rounded-xl border border-stone-800 leather p-5" data-testid={`order-${o.session_id}`}>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-stone-400">{t("order_no")} #{o.session_id.slice(-8).toUpperCase()}</span>
              <span className="text-stone-400">{new Date(o.created_at).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA")}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-stone-200">
              {o.items.map((i) => <li key={i.product_id}>{i.qty} × {byId[i.product_id]?.name[lang]}</li>)}
            </ul>
            <div className="mt-3 flex justify-between border-t border-stone-800 pt-3 text-sm">
              <span className="text-stone-400">{t("tax")}: {money(o.tax, lang)}</span>
              <span className="font-semibold text-amber-300">{t("total")}: {money(o.amount_total ?? o.amount, lang)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
