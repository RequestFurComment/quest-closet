import "@/App.css";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Show, SignIn, SignUp } from "@clerk/react";
import { Toaster } from "@/components/ui/sonner";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { LangProvider } from "@/lib/i18n";
import { AppStateProvider } from "@/lib/appState";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Events from "@/pages/Events";
import Shop from "@/pages/Shop";
import BuildLook from "@/pages/BuildLook";
import Interview from "@/pages/Interview";
import LookDetail from "@/pages/LookDetail";
import Looks from "@/pages/Looks";
import { Checkout, Orders, PaymentCancel, PaymentSuccess } from "@/pages/Commerce";

const RequireSignIn = () => (
  <>
    <Show when="signed-in"><Outlet /></Show>
    <Show when="signed-out"><Navigate to="/sign-in" replace /></Show>
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
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/events" element={<Events />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/build" element={<BuildLook />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/looks" element={<Looks />} />
                <Route path="/looks/:id" element={<LookDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route element={<RequireSignIn />}>
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
