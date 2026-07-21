import { createContext, useEffect, useState } from "react";
import { fetchCategories } from "../Service/CategoryService.js";
import { fetchItems } from "../Service/ItemService.js";

export const AppContext = createContext(null);

export const AppContextProvider = (props) => {

    const [categories, setCategories] = useState([]);
    const [itemsData, setItemsData]   = useState([]);
    const [auth, setAuth]             = useState({ token: null, role: null,  name: null });
    const [cartItems, setCartItems]   = useState([]);

    // ── Load catalogue data ───────────────────────────────────────
    // FIX: accepts a token argument so we can call it right after
    // login (when localStorage may not be readable yet by axios)
    const loadCatalogueData = async (token) => {
        const t = token || localStorage.getItem("token");
        if (!t) return; // no token → don't fetch, backend will 401
        try {
            const [catRes, itemRes] = await Promise.all([
                fetchCategories(),
                fetchItems(),
            ]);
            setCategories(catRes.data);
            setItemsData(itemRes.data);
        } catch (err) {
            console.error("Failed to load catalogue:", err);
        }
    };

    // On app mount: if token already exists in localStorage (page refresh),
    // restore auth state and fetch data immediately
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedRole  = localStorage.getItem("role");
        const savedName  = localStorage.getItem("name");

        if (savedToken && savedRole) {
         setAuth({
        token: savedToken,
        role: savedRole,
        name: savedName
    });

        loadCatalogueData(savedToken);
    }
        // No token → user is on login page, don't fetch
    }, []);

    // Called by Login.jsx after successful login
   const setAuthData = (token, role, name) => {
    setAuth({
        token,
        role,
        name
    });

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);

    loadCatalogueData(token);

    };

    // ── Cart helpers ──────────────────────────────────────────────
    const isOOS = (itemId) => {
        const live = itemsData.find(i => i.itemId === itemId);
        return typeof live?.stockQuantity === "number" && live.stockQuantity <= 0;
    };

    const addToCart = (item) => {
        if (isOOS(item.itemId)) return;
        const existing = cartItems.find(c => c.itemId === item.itemId);
        if (existing) {
            const live  = itemsData.find(i => i.itemId === item.itemId);
            const stock = live?.stockQuantity;
            const newQty = existing.quantity + 1;
            if (typeof stock === "number" && newQty > stock) return;
            setCartItems(cartItems.map(c =>
                c.itemId === item.itemId ? { ...c, quantity: newQty } : c
            ));
        } else {
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(item => item.itemId !== itemId));
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const live  = itemsData.find(i => i.itemId === itemId);
        const stock = live?.stockQuantity;
        if (typeof stock === "number" && newQuantity > stock) return;
        setCartItems(cartItems.map(item =>
            item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const clearCart = () => setCartItems([]);

    const deductStockAfterOrder = (orderedItems) => {
        setItemsData(prev => prev.map(item => {
            const ordered = orderedItems.find(o => o.itemId === item.itemId);
            if (ordered && typeof item.stockQuantity === "number") {
                return { ...item, stockQuantity: Math.max(0, item.stockQuantity - ordered.quantity) };
            }
            return item;
        }));
    };

    const contextValue = {
        categories, setCategories,
        auth, setAuthData,
        itemsData, setItemsData,
        addToCart, cartItems,
        removeFromCart, updateQuantity,
        clearCart, deductStockAfterOrder,
        loadCatalogueData,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    );
};
