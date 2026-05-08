import { createContext, useEffect, useState } from "react";
import { fetchCategories } from "../Service/CategoryService.js";
import { fetchItems } from "../Service/ItemService.js";

export const AppContext = createContext(null);

export const AppContextProvider = (props) => {

    const [categories, setCategories] = useState([]);
    const [itemsData, setItemsData] = useState([]);
    const [auth, setAuth] = useState({ token: null, role: null });
    const [cartItems, setCartItems] = useState([]);

    // Bulletproof OOS check — only blocks when it's a real number <= 0
    const isOOS = (itemId) => {
        const live = itemsData.find(i => i.itemId === itemId);
        return typeof live?.stockQuantity === "number" && live.stockQuantity <= 0;
    };

    const addToCart = (item) => {
        if (isOOS(item.itemId)) return; // hard block

        const existing = cartItems.find(c => c.itemId === item.itemId);
        if (existing) {
            const live = itemsData.find(i => i.itemId === item.itemId);
            const stock = live?.stockQuantity;
            const newQty = existing.quantity + 1;
            // Don't exceed stock if known
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
        const live = itemsData.find(i => i.itemId === itemId);
        const stock = live?.stockQuantity;
        if (typeof stock === "number" && newQuantity > stock) return;
        setCartItems(cartItems.map(item =>
            item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        ));
    };

    // Reduces stock in local state immediately after a successful order
    const deductStockAfterOrder = (orderedItems) => {
        setItemsData(prev => prev.map(item => {
            const ordered = orderedItems.find(o => o.itemId === item.itemId);
            if (ordered && typeof item.stockQuantity === "number") {
                return { ...item, stockQuantity: Math.max(0, item.stockQuantity - ordered.quantity) };
            }
            return item;
        }));
    };

    useEffect(() => {
        async function loadData() {
            if (localStorage.getItem("token") && localStorage.getItem("role")) {
                setAuthData(
                    localStorage.getItem("token"),
                    localStorage.getItem("role")
                );
            }
            const response = await fetchCategories();
            const itemResponse = await fetchItems();
            setCategories(response.data);
            setItemsData(itemResponse.data);
        }
        loadData();
    }, []);

    const setAuthData = (token, role) => {
        setAuth({ token, role });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const contextValue = {
        categories,
        setCategories,
        auth,
        setAuthData,
        itemsData,
        setItemsData,
        addToCart,
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        deductStockAfterOrder,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    );
};
