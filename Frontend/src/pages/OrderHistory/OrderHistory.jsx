import './OrderHistory.css';
import { useEffect, useState } from "react";
import { latestOrders } from "../../Service/OrderService.js";

// FIX: show FAILED badge in red
const StatusBadge = ({ status }) => {
    if (status === "COMPLETED")
        return <span className="oh-badge oh-badge-success">COMPLETED</span>;
    if (status === "FAILED")
        return <span className="oh-badge oh-badge-failed">FAILED</span>;
    return <span className="oh-badge oh-badge-pending">PENDING</span>;
};

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await latestOrders();
                setOrders(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatItems = (items) =>
        items.map((item) => `${item.name} x ${item.quantity}`).join(', ');

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    if (loading) return (
        <div className="oh-wrapper">
            <div className="text-center text-light py-5">
                <div className="spinner-border text-success" role="status" />
                <p className="mt-2">Loading orders...</p>
            </div>
        </div>
    );

    if (orders.length === 0) return (
        <div className="oh-wrapper">
            <div className="text-center text-muted py-5">No orders found</div>
        </div>
    );

    return (
        <div className="oh-wrapper">
            <h2 className="oh-title">
                <i className="bi bi-receipt me-2"></i>All Orders
                <span className="oh-count">{orders.length}</span>
            </h2>

            <div className="oh-scroll">
                <table className="oh-table">
                    <thead>
                        <tr>
                            <th>Order Id</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.orderId}>
                                <td className="oh-orderid">{order.orderId}</td>
                                <td>
                                    <div className="oh-customer-name">{order.customerName}</div>
                                    <div className="oh-customer-phone">{order.phoneNumber}</div>
                                </td>
                                <td className="oh-items">{formatItems(order.items)}</td>
                                <td className="oh-total">₹{order.grandTotal}</td>
                                <td className="oh-payment">{order.paymentMethod}</td>
                                <td>
                                    <StatusBadge status={order.paymentDetails?.status} />
                                </td>
                                <td className="oh-date">{formatDate(order.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderHistory;
