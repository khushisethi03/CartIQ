import './OrderHistory.css';
import { useEffect, useState } from "react";
import { latestOrders, markOrderFailed } from "../../Service/OrderService.js";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
    if (status === "COMPLETED") return <span className="oh-badge oh-badge-success">COMPLETED</span>;
    if (status === "FAILED")    return <span className="oh-badge oh-badge-failed">FAILED</span>;
    return <span className="oh-badge oh-badge-pending">PENDING</span>;
};

const OrderHistory = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(null); // orderId being processed

    useEffect(() => {
        latestOrders()
            .then(r => setOrders(r.data))
            .catch(() => toast.error("Failed to load orders"))
            .finally(() => setLoading(false));
    }, []);

    const handleMarkFailed = async (orderId) => {
        if (!window.confirm("Mark this order as FAILED?")) return;
        setMarking(orderId);
        try {
            await markOrderFailed(orderId);
            setOrders(prev => prev.map(o =>
                o.orderId === orderId
                    ? { ...o, paymentDetails: { ...o.paymentDetails, status: "FAILED" } }
                    : o
            ));
            toast.success("Order marked as FAILED");
        } catch (e) {
            toast.error("Could not update order");
        } finally {
            setMarking(null);
        }
    };

    const formatItems = (items) => items.map(i => `${i.name} x ${i.quantity}`).join(', ');
    const formatDate  = (d) => new Date(d).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (loading) return (
        <div className="oh-wrapper">
            <div className="text-center text-light py-5">
                <div className="spinner-border text-success" role="status" />
            </div>
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
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const status = order.paymentDetails?.status;
                            return (
                                <tr key={order.orderId}>
                                    <td className="oh-orderid">{order.orderId}</td>
                                    <td>
                                        <div className="oh-customer-name">{order.customerName}</div>
                                        <div className="oh-customer-phone">{order.phoneNumber}</div>
                                    </td>
                                    <td className="oh-items">{formatItems(order.items)}</td>
                                    <td className="oh-total">₹{order.grandTotal}</td>
                                    <td className="oh-payment">{order.paymentMethod}</td>
                                    <td><StatusBadge status={status} /></td>
                                    <td className="oh-date">{formatDate(order.createdAt)}</td>
                                    <td>
                                        {/* Show "Mark Failed" button only for PENDING orders */}
                                        {status === "PENDING" && (
                                            <button
                                                className="oh-fail-btn"
                                                onClick={() => handleMarkFailed(order.orderId)}
                                                disabled={marking === order.orderId}
                                                title="Mark as Failed">
                                                {marking === order.orderId
                                                    ? <span className="spinner-border spinner-border-sm"></span>
                                                    : <><i className="bi bi-x-circle me-1"></i>Failed</>}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderHistory;
