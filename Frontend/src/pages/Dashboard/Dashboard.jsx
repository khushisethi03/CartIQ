import './Dashboard.css';
import { useEffect, useState } from "react";
import { fetchDashboardData } from "../../Service/Dashboard.js";
import { fetchInventory } from "../../Service/InventoryService.js";
import toast from "react-hot-toast";
import {
    PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import AIAssistant from "../../components/AIAssistant/AIAssistant.jsx";

const COLORS = ["#20c997", "#0dcaf0", "#ffc107", "#dc3545"];

const Dashboard = () => {
    const [data, setData]           = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        Promise.all([
            fetchDashboardData(),
            fetchInventory().catch(() => ({ data: [] }))
        ])
        .then(([dashRes, invRes]) => {
            setData(dashRes.data);
            setInventory(invRes.data || []);
        })
        .catch(() => toast.error("Unable to load dashboard"))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
    if (!data)   return <div className="dashboard-error">Failed to load dashboard data.</div>;

    const pieData = data.paymentBreakdown?.map(p => ({
        name: p.method, value: p.count, amount: p.totalAmount
    })) || [];

    const barData = data.weeklyTrend?.map(d => ({
        date: d.date?.substring(5),
        sales: parseFloat(d.totalAmount?.toFixed(2) || 0)
    })) || [];

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                {/* Stat Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="bi bi-currency-rupee"></i></div>
                        <div className="stat-content">
                            <h3>Today's Sales</h3>
                            <p>₹{data.todaySales?.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(13,202,240,0.1)", color: "#0dcaf0" }}>
                            <i className="bi bi-cart-check"></i>
                        </div>
                        <div className="stat-content">
                            <h3>Today's Orders</h3>
                            <p>{data.todayOrderCount}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(255,193,7,0.1)", color: "#ffc107" }}>
                            <i className="bi bi-calendar-month"></i>
                        </div>
                        <div className="stat-content">
                            <h3>Month Sales</h3>
                            <p>₹{data.monthSales?.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: "rgba(102,16,242,0.1)", color: "#6610f2" }}>
                            <i className="bi bi-box-seam"></i>
                        </div>
                        <div className="stat-content">
                            <h3>Month Orders</h3>
                            <p>{data.monthOrderCount}</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-row">
                    <div className="chart-card">
                        <h5 className="chart-card-title">
                            <i className="bi bi-pie-chart-fill me-2 text-info"></i>Payment Breakdown
                        </h5>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                        paddingAngle={3} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                                        {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v,n) => [`${v} orders`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted text-center py-4">No sales data yet</p>}
                    </div>
                    <div className="chart-card">
                        <h5 className="chart-card-title">
                            <i className="bi bi-bar-chart-fill me-2 text-success"></i>7-Day Trend
                        </h5>
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={barData} margin={{ top:5, right:10, left:0, bottom:5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#495057" />
                                    <XAxis dataKey="date" tick={{ fill:"#adb5bd", fontSize:11 }} />
                                    <YAxis tick={{ fill:"#adb5bd", fontSize:11 }} />
                                    <Tooltip contentStyle={{ background:"#343a40", border:"none", color:"#f8f9fa" }}
                                        formatter={v => [`₹${v}`, "Sales"]} />
                                    <Bar dataKey="sales" fill="#20c997" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted text-center py-4">No trend data yet</p>}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="recent-orders-card">
                    <h3 className="recent-orders-title">
                        <i className="bi bi-clock-history"></i> Recent Orders
                    </h3>
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order Id</th><th>Customer</th><th>Amount</th>
                                    <th>Payment</th><th>Status</th><th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentOrders?.map(order => (
                                    <tr key={order.orderId}>
                                        <td>{order.orderId.substring(0,8)}...</td>
                                        <td>{order.customerName}</td>
                                        <td>₹{order.grandTotal?.toFixed(2)}</td>
                                        <td><span className={`payment-method ${order.paymentMethod?.toLowerCase()}`}>{order.paymentMethod}</span></td>
                                        <td><span className={`status-badge ${order.paymentDetails?.status?.toLowerCase()}`}>{order.paymentDetails?.status}</span></td>
                                        <td>{new Date(order.createdAt).toLocaleString([],{ month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* AI Assistant — floating, available on all pages but data-aware on Dashboard */}
            <AIAssistant dashboardData={data} inventoryData={inventory} />
        </div>
    );
};

export default Dashboard;
