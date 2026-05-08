import './OrderHistory.css';
import {useEffect, useState} from "react";
import {latestOrders} from "../../Service/OrderService.js";

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
        }
        fetchOrders();
    }, []);

    const formatItems = (items) => {
        return items.map((item) => `${item.name} x ${item.quantity}`).join(', ');
    }

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    if (loading) {
        return (
            <div className="orders-history-container">
                <div className="text-center py-4 text-light">Loading orders...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="orders-history-container">
                <h2 className="mb-2 text-light">All Orders</h2>
                <div className="text-center py-4 text-muted">No orders found</div>
            </div>
        );
    }

    return (
        <div className="orders-history-container">
            <h2 className="mb-1 text-light">
                <i className="bi bi-receipt me-2"></i>All Orders
                <span className="ms-2 badge bg-secondary" style={{fontSize:'0.65rem',verticalAlign:'middle'}}>{orders.length}</span>
            </h2>

            {/* Scrollable table */}
            <div className="orders-table-scroll">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
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
                            <td><small className="text-muted font-monospace">{order.orderId}</small></td>
                            <td>
                                {order.customerName}<br/>
                                <small className="text-muted">{order.phoneNumber}</small>
                            </td>
                            <td><small>{formatItems(order.items)}</small></td>
                            <td className="fw-semibold text-light">₹{order.grandTotal}</td>
                            <td>{order.paymentMethod}</td>
                            <td>
                                <span className={`badge ${order.paymentDetails?.status === "COMPLETED" ? "bg-success" : "bg-warning text-dark"}`}>
                                    {order.paymentDetails?.status || "PENDING"}
                                </span>
                            </td>
                            <td><small>{formatDate(order.createdAt)}</small></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OrderHistory;
