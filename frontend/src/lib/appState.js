import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const Ctx = createContext(null);

export const useApi = () => {
  const { getToken } = useAuth();
  return useCallback(async (method, path, data, opts = {}) => {
    const token = await getToken();
    const res = await axios({ method, url: `${API}${path}`, data, headers: { Authorization: `Bearer ${token}` }, ...opts });
    return res.data;
  }, [getToken]);
};

export const AppStateProvider = ({ children }) => {
  const api = useApi();
  const { isSignedIn } = useAuth();
  const [catalog, setCatalog] = useState({ categories: [], products: [] });
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => { axios.get(`${API}/catalog`).then((r) => setCatalog(r.data)); }, []);
  useEffect(() => {
    if (!isSignedIn) { setProfile(null); setCart([]); return; }
    api("get", "/profile").then(setProfile).catch(() => setProfile({}));
    api("get", "/cart").then((r) => setCart(r.items)).catch(() => {});
  }, [isSignedIn, api]);

  const byId = useMemo(() => Object.fromEntries(catalog.products.map((p) => [p.id, p])), [catalog]);

  const addToCart = useCallback(async (ids) => {
    const r = await api("post", "/cart/add", { product_ids: ids });
    setCart(r.items);
    setCartOpen(true);
  }, [api]);

  const updateCart = useCallback(async (items) => {
    const r = await api("put", "/cart", { items });
    setCart(r.items);
  }, [api]);

  const refreshCart = useCallback(() => api("get", "/cart").then((r) => setCart(r.items)), [api]);

  const value = { api, catalog, byId, profile, setProfile, cart, addToCart, updateCart, refreshCart, cartOpen, setCartOpen, toast };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useApp = () => useContext(Ctx);
