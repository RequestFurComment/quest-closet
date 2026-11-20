import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles, Swords } from "lucide-react";
import { useLang } from "@/lib/i18n";

const HERO = "https://images.pexels.com/photos/35248220/pexels-photo-35248220.jpeg?auto=compress&cs=tinysrgb&w=1600";

export default function Landing() {
  const { t } = useLang();
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/30" />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:py-32">
        <p className="rise text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">{t("hero_eyebrow")}</p>
        <h1 className="rise mt-4 max-w-3xl text-4xl font-bold leading-[1.05] text-amber-50 sm:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
          {t("hero_title")}
        </h1>
        <p className="rise mt-6 max-w-xl text-base text-stone-300" style={{ animationDelay: "160ms" }}>{t("hero_sub")}</p>
        <div className="rise mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "240ms" }}>
          <Link to="/sign-in" data-testid="landing-signin-btn"
            className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-950 transition-transform hover:scale-[1.03]">
            {t("signin")} <ArrowRight size={18} />
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-stone-400"><MapPin size={14} className="text-amber-500" />{t("quebec_only_note")}</span>
        </div>
        <div className="rise mt-16 grid max-w-2xl gap-4 sm:grid-cols-2" style={{ animationDelay: "320ms" }}>
          {[["flow_a_title", "flow_a_desc", Swords], ["flow_b_title", "flow_b_desc", Sparkles]].map(([a, b, Icon]) => (
            <div key={a} className="rounded-xl border border-stone-800 bg-stone-950/70 p-5 backdrop-blur-md">
              <Icon className="text-amber-400" size={20} />
              <p className="mt-3 font-display text-base text-amber-100">{t(a)}</p>
              <p className="mt-1 text-sm text-stone-400">{t(b)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
