import { useEffect, useState } from "react";
import { fetchInventory, fetchLowStock, updateStock } from "../../Service/InventoryService.js";
import toast from "react-hot-toast";
import "./Inventory.css";

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [editId, setEditId] = useState(null);
    const [editQty, setEditQty] = useState(0);
    const [search, setSearch] = useState("");

    const load = async () => {
        try {
            const fn = filter === "low" ? fetchLowStock : fetchInventory;
            const res = await fn();
            setItems(res.data);
        } catch (e) {
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [filter]);

    const handleSave = async (itemId) => {
        try {
            await updateStock(itemId, editQty);
            toast.success("Stock updated!");
            setEditId(null);
            load();
        } catch (e) {
            toast.error("Failed to update stock");
        }
    };

    const stockBadge = (qty) => {
        if (qty <= 0) return <span className="badge bg-danger">Out of Stock</span>;
        if (qty <= 5) return <span className="badge bg-warning text-dark">Low Stock</span>;
        return <span className="badge bg-success">In Stock</span>;
    };

    const filtered = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.categoryName || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="inventory-wrapper">
            <div className="inventory-container text-center text-light py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">Loading inventory...</p>
            </div>
        </div>
    );

    return (
        // FIX: added inventory-wrapper for scroll — inventory-container alone had min-height:100vh with no overflow
        <div className="inventory-wrapper">
            <div className="inventory-container">
                <div className="inventory-header">
                    <div>
                        <h2 className="inventory-title">
                            <i className="bi bi-boxes me-2"></i>Inventory Management
                        </h2>
                        <p className="text-muted mb-0">{items.length} products total</p>
                    </div>
                    <div className="inventory-actions">
                        <input
                            className="form-control form-control-sm search-box"
                            placeholder="Search items..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="btn-group ms-2">
                            <button
                                className={`btn btn-sm ${filter === "all" ? "btn-info" : "btn-outline-info"}`}
                                onClick={() => setFilter("all")}>All Items</button>
                            <button
                                className={`btn btn-sm ${filter === "low" ? "btn-warning" : "btn-outline-warning"}`}
                                onClick={() => setFilter("low")}>Low Stock</button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock Qty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item.itemId}>
                                    <td>
                                        {item.imgUrl
                                            ? <img src={item.imgUrl} alt={item.name} className="inventory-thumb" />
                                            : <div className="inventory-thumb-placeholder"><i className="bi bi-image"></i></div>
                                        }
                                    </td>
                                    <td>
                                        <div className="fw-semibold">{item.name}</div>
                                        <small className="text-secondary">{item.description?.substring(0, 40) || ""}</small>
                                    </td>
                                    <td><span className="badge bg-secondary">{item.categoryName || "—"}</span></td>
                                    <td className="text-info fw-bold">₹{parseFloat(item.price).toFixed(2)}</td>
                                    <td>
                                        {editId === item.itemId ? (
                                            <input
                                                type="number"
                                                className="form-control form-control-sm qty-input"
                                                value={editQty}
                                                min={0}
                                                onChange={e => setEditQty(parseInt(e.target.value) || 0)}
                                            />
                                        ) : (
                                            <span className="fw-bold">{item.stockQuantity}</span>
                                        )}
                                    </td>
                                    <td>{stockBadge(item.stockQuantity)}</td>
                                    <td>
                                        {editId === item.itemId ? (
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-sm btn-success" onClick={() => handleSave(item.itemId)}>
                                                    <i className="bi bi-check-lg"></i>
                                                </button>
                                                <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => { setEditId(item.itemId); setEditQty(item.stockQuantity); }}
                                            >
                                                <i className="bi bi-pencil me-1"></i>Edit Stock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-muted py-4">No items found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
