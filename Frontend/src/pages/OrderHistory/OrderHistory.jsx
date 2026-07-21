import './OrderHistory.css';
import { useEffect, useState } from "react";
import { latestOrders, markOrderFailed } from "../../Service/OrderService.js";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup";
import toast from "react-hot-toast";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StatusBadge = ({ status }) => {
    if (status === "COMPLETED") return <span className="oh-badge oh-badge-success">COMPLETED</span>;
    if (status === "FAILED")    return <span className="oh-badge oh-badge-failed">FAILED</span>;
    return <span className="oh-badge oh-badge-pending">PENDING</span>;
};

const OrderHistory = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(null); // orderId being processed

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

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

    const handlePrint = (order) => {

    setSelectedOrder(order);

    setShowReceipt(true);

    };

    const printReceipt = () => {

    window.print();

    };
    const formatItems = (items) => items.map(i => `${i.name} x ${i.quantity}`).join(', ');
    const formatDate  = (d) => new Date(d).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
        const exportToExcel = () => {

    const data = filteredOrders.map(order => ({

        "Order ID": order.orderId,

        "Customer": order.customerName,

        "Phone": order.phoneNumber,

        "Items": formatItems(order.items),

        "Total": order.grandTotal,

        "Payment": order.paymentMethod,

        "Status": order.paymentDetails?.status,

        "Date": formatDate(order.createdAt)

    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    saveAs(
        new Blob([excelBuffer]),
        "OrderHistory.xlsx"
    );

    };
    const filteredOrders = orders.filter(order => {

    const statusMatch =
        statusFilter === "ALL" ||
        order.paymentDetails?.status === statusFilter;

    const paymentMatch =
        paymentFilter === "ALL" ||
        order.paymentMethod === paymentFilter;

    const searchMatch =
        order.customerName
            .toLowerCase()
            .includes(search.toLowerCase());

    return statusMatch && paymentMatch && searchMatch;

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
            <div className="oh-header">

    <h2 className="oh-title">
        <i className="bi bi-receipt me-2"></i>
        All Orders
        <span className="oh-count">
            {filteredOrders.length}
        </span>
    </h2>

    <button
        className="btn btn-success"
        onClick={exportToExcel}
    >
        <i className="bi bi-file-earmark-excel-fill me-2"></i>

        Export Excel

    </button>

    </div>

        <div className="oh-filters">

        <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
         >
        <option value="ALL">All Status</option>
        <option value="COMPLETED">Completed</option>
        <option value="PENDING">Pending</option>
        <option value="FAILED">Failed</option>
        </select>

         <select
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value)}
        >
        <option value="ALL">All Payment</option>
        <option value="CASH">Cash</option>
        <option value="UPI">UPI</option>
        </select>

        <input
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />

        </div>
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
                        {filteredOrders.map(order =>  {
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

    <div className="d-flex gap-2">

        {status === "COMPLETED" && (
            <button
                className="btn btn-outline-success btn-sm"
                onClick={() => handlePrint(order)}
                title="Print Receipt"
            >
                <i className="bi bi-printer-fill"></i>
            </button>
        )}

        {status === "PENDING" && (
            <button
                className="oh-fail-btn"
                onClick={() => handleMarkFailed(order.orderId)}
                disabled={marking === order.orderId}
                title="Mark as Failed"
            >
                {marking === order.orderId
                    ? <span className="spinner-border spinner-border-sm"></span>
                    : (
                        <>
                            <i className="bi bi-x-circle me-1"></i>
                            Failed
                        </>
                    )}
            </button>
        )}

                            </div>

                                </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {showReceipt && selectedOrder && (
        <ReceiptPopup
        orderDetails={selectedOrder}
        onClose={() => setShowReceipt(false)}
        onPrint={printReceipt}
     />
    )}
        </div>
    );
};

export default OrderHistory;
