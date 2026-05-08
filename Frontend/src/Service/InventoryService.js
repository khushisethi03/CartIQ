import axios from "axios";

const BASE = "http://localhost:8080/api/v1.0";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const fetchInventory = async () =>
    axios.get(`${BASE}/inventory`, { headers: headers() });

export const updateStock = async (itemId, qty) =>
    axios.patch(`${BASE}/inventory/${itemId}/stock`, { stockQuantity: qty }, { headers: headers() });

export const fetchLowStock = async (threshold = 5) =>
    axios.get(`${BASE}/inventory/low-stock?threshold=${threshold}`, { headers: headers() });