import { useEffect, useState } from "react";
import { fetchSalesAnalytics } from "../../Service/SalesService.js";
import toast from "react-hot-toast";
import "./SalesAnalytics.css";
import {
    PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

const COLORS = ["#20c997", "#0dcaf0", "#ffc107", "#dc3545", "#6610f2", "#fd7e14"];

const SalesAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalesAnalytics()
            .then(r => setData(r.data))
            .catch(() => toast.error("Failed to load analytics"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="analytics-wrapper">
            <div className="analytics-container text-center py-5">
                <div className="spinner-border text-success" role="status" />
                <p className="mt-2 text-light">Loading analytics...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="analytics-wrapper">
            <div className="analytics-container text-light text-center py-5">
                Failed to load data.
            </div>
        </div>
    );

    const pieData = data.paymentBreakdown?.map(p => ({
        name: p.method, value: p.count, amount: p.totalAmount
    })) || [];

    const barData = data.weeklyTrend?.map(d => ({
        date: d.date.substring(5),
        sales: parseFloat(d.totalAmount?.toFixed(2) || 0),
    })) || [];

    return (
        <div className="analytics-wrapper">
            <div className="analytics-container">
                <h2 className="analytics-title">
                    <i className="bi bi-graph-up-arrow me-2"></i>Sales Analytics
                </h2>

                {/* Summary cards */}
                <div className="stats-row">
                    {[
                        { label: "Today's Sales",  value: `₹${data.todaySales?.toFixed(2)}`,     icon: "bi-sun",            color: "#ffc107" },
                        { label: "Today's Orders", value: data.todayOrderCount,                   icon: "bi-cart-check",     color: "#20c997" },
                        { label: "Month Sales",    value: `₹${data.monthSales?.toFixed(2)}`,      icon: "bi-calendar-month", color: "#0dcaf0" },
                        { label: "Month Orders",   value: data.monthOrderCount,                   icon: "bi-box-seam",       color: "#6610f2" },
                        { label: "Total Revenue",  value: `₹${data.totalRevenue?.toFixed(2)}`,    icon: "bi-cash-stack",     color: "#20c997" },
                        { label: "Total Orders",   value: data.totalOrders,                       icon: "bi-receipt",        color: "#fd7e14" },
                    ].map((s, i) => (
                        <div className="summary-card" key={i}
                            style={{ borderLeft: `4px solid ${s.color}` }}>
                            <i className={`bi ${s.icon} summary-icon`} style={{ color: s.color }}></i>
                            <div>
                                <div className="summary-label">{s.label}</div>
                                <div className="summary-value">{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="charts-row">
                    <div className="chart-card">
                        <h5 className="chart-title">
                            <i className="bi bi-pie-chart me-2"></i>Payment Methods
                        </h5>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={100}
                                        paddingAngle={4} dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {pieData.map((_, i) =>
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n, p) =>
                                        [`${v} orders (₹${p.payload.amount?.toFixed(2)})`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted text-center py-4">No payment data yet</p>}
                    </div>

                    <div className="chart-card">
                        <h5 className="chart-title">
                            <i className="bi bi-bar-chart me-2"></i>7-Day Sales Trend
                        </h5>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={barData}
                                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#495057" />
                                    <XAxis dataKey="date" tick={{ fill: "#adb5bd", fontSize: 12 }} />
                                    <YAxis tick={{ fill: "#adb5bd", fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ background: "#343a40", border: "none", color: "#f8f9fa" }}
                                        formatter={(v) => [`₹${v}`, "Sales"]} />
                                    <Bar dataKey="sales" fill="#20c997" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted text-center py-4">No trend data yet</p>}
                    </div>
                </div>

                {/* Sales by User table */}
                <div className="user-sales-card">
                    <h5 className="chart-title">
                        <i className="bi bi-people me-2"></i>Sales by User
                    </h5>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Today's Sales</th>
                                    <th>Today's Orders</th>
                                    <th>Total Revenue</th>
                                    <th>Total Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.userSalesSummary?.map(u => (
                                    <tr key={u.userId}>
                                        <td className="col-name">{u.userName}</td>
                                        {/* FIX: explicit col-email class — was inheriting Bootstrap link blue */}
                                        <td className="col-email">{u.userEmail}</td>
                                        <td className="col-today">
                                            ₹{u.todaySales?.toFixed(2) || "0.00"}
                                        </td>
                                        <td>{u.todayOrders || 0}</td>
                                        <td className="col-revenue">
                                            ₹{u.totalRevenue?.toFixed(2) || "0.00"}
                                        </td>
                                        <td>{u.totalOrders || 0}</td>
                                    </tr>
                                ))}
                                {(!data.userSalesSummary ||
                                  data.userSalesSummary.length === 0) && (
                                    <tr>
                                        <td colSpan={6}
                                            className="text-center text-muted py-3">
                                            No user data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
