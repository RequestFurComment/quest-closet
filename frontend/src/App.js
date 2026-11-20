import "@/App.css";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Show, SignIn, SignUp } from "@clerk/react";
import { Loader2, MapPinOff } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { LangProvider, useLang } from "@/lib/i18n";
import { AppStateProvider, useApp } from "@/lib/appState";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Events from "@/pages/Events";
import Shop from "@/pages/Shop";
import BuildLook from "@/pages/BuildLook";
import Interview from "@/pages/Interview";
import LookDetail from "@/pages/LookDetail";
import Looks from "@/pages/Looks";
import { Checkout, Orders, PaymentCancel, PaymentSuccess } from "@/pages/Commerce";

const NotQuebec = () => {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center" data-testid="not-quebec-message">
      <MapPinOff className="mx-auto text-amber-400" size={40} />
      <h1 className="mt-4 text-3xl font-bold text-amber-50">{t("not_quebec_title")}</h1>
      <p className="mt-2 text-stone-400">{t("not_quebec_body")}</p>
    </div>
  );
};

const Gate = () => {
  const { profile } = useApp();
  const { pathname } = useLocation();
  if (profile === null) return <div className="grid h-64 place-items-center"><Loader2 className="animate-spin text-amber-400" /></div>;
  if (pathname === "/profile") return <Outlet />;
  if (profile.quebec_resident === false) return <><NotQuebec /><Profile /></>;
  if (!profile.quebec_resident) return <Navigate to="/profile" replace />;
  return <Outlet />;
};

const Protected = () => (
  <>
    <Show when="signed-in"><Gate /></Show>
    <Show when="signed-out"><Navigate to="/sign-in" replace /></Show>
  </>
);

const Root = () => (
  <>
    <Show when="signed-in"><Gate /></Show>
    <Show when="signed-out"><Landing /></Show>
  </>
);

const AuthPage = ({ children }) => <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">{children}</div>;

function Layout() {
  return (
    <div className="grain min-h-screen bg-stone-950">
      <Header />
      <main><Outlet /></main>
      <CartDrawer />
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <ClerkAuthProvider>
          <AppStateProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/sign-in/*" element={<AuthPage><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" withSignUp /></AuthPage>} />
                <Route path="/sign-up/*" element={<AuthPage><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" /></AuthPage>} />
                <Route path="/" element={<Root />}><Route index element={<Home />} /></Route>
                <Route element={<Protected />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/build" element={<BuildLook />} />
                  <Route path="/interview" element={<Interview />} />
                  <Route path="/looks" element={<Looks />} />
                  <Route path="/looks/:id" element={<LookDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                </Route>
              </Route>
            </Routes>
          </AppStateProvider>
        </ClerkAuthProvider>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
