import axios from "axios";

const BASE = "http://localhost:8080/api/v1.0";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const fetchSalesAnalytics = async () =>
    axios.get(`${BASE}/admin/sales-analytics`, { headers: headers() });