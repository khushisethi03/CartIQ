import axios from "axios";

const AUTH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const BASE = "http://localhost:8080/api/v1.0";

export const latestOrders = async () =>
    await axios.get(`${BASE}/orders/latest`, { headers: AUTH() });

export const createOrder = async (order) =>
    await axios.post(`${BASE}/orders`, order, { headers: AUTH() });

export const deleteOrder = async (id) =>
    await axios.delete(`${BASE}/orders/${id}`, { headers: AUTH() });

// NEW: marks order as FAILED in DB instead of deleting
export const markOrderFailed = async (orderId) =>
    await axios.post(`${BASE}/payments/failed/${orderId}`, {}, { headers: AUTH() });

