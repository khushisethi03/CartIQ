import './Explore.css';
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { assets } from "../../assets/assets.js";
import CartSummary from "../../components/CartSummary/CartSummary.jsx";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";
import { createOrder, markOrderFailed } from "../../Service/OrderService.js";
import { createRazorpayOrder, verifyPayment } from "../../Service/PaymentService.js";
import { AppConstants } from "../../util/constants.js";
import toast from "react-hot-toast";

// ── Category pill ──────────────────────────────────────────────
const CategoryPill = ({ name, imgUrl, count, bgColor, isSelected, onClick }) => (
    <div className={`cat-pill ${isSelected ? 'active' : ''}`}
        style={{ background: bgColor || '#343a40' }}
        onClick={onClick}>
        <img src={imgUrl} alt={name} className="cat-pill-img" />
        <div className="cat-pill-info">
            <div className="cat-pill-name">{name}</div>
            <div className="cat-pill-count">{count} Items</div>
        </div>
        {isSelected && (
            <div className="cat-pill-check"><i className="bi bi-check-lg"></i></div>
        )}
    </div>
);

// ── Item card ──────────────────────────────────────────────────
const ItemCard = ({ item, onAdd }) => {
    const isOOS = typeof item.stockQuantity === "number" && item.stockQuantity <= 0;
    return (
        <div className={`item-card-v2 ${isOOS ? 'oos' : ''}`}>
            <div className="item-card-img-wrap">
                <img src={item.imgUrl} alt={item.name} className="item-card-img" />
                {isOOS && (
                    <div className="item-oos-overlay">
                        <span className="item-oos-badge">OUT OF STOCK</span>
                    </div>
                )}
            </div>
            <div className="item-card-body">
                <div className="item-card-name">{item.name}</div>
                <div className="item-card-footer">
                    <div className="item-card-price">₹{item.price}</div>
                    <button className="item-add-btn-v2"
                        onClick={() => !isOOS && onAdd(item)}
                        disabled={isOOS}
                        title={isOOS ? "Out of stock" : "Add to cart"}>
                        <i className="bi bi-plus-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Cart item row ──────────────────────────────────────────────
const CartRow = ({ item, onQtyChange, onRemove }) => (
    <div className="cart-item-row">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-row-bottom">
            <div className="cart-item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
            <div className="cart-qty-controls">
                <button className="cart-qty-btn minus"
                    onClick={() => onQtyChange(item.itemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}>
                    <i className="bi bi-dash"></i>
                </button>
                <span className="cart-qty-num">{item.quantity}</span>
                <button className="cart-qty-btn plus"
                    onClick={() => onQtyChange(item.itemId, item.quantity + 1)}>
                    <i className="bi bi-plus"></i>
                </button>
                <button className="cart-del-btn" onClick={() => onRemove(item.itemId)}>
                    <i className="bi bi-trash3"></i>
                </button>
            </div>
        </div>
    </div>
);

// ── Main Explore Page ──────────────────────────────────────────
const Explore = () => {
    const { categories, itemsData, addToCart, cartItems, removeFromCart,
            updateQuantity, clearCart, deductStockAfterOrder } = useContext(AppContext);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [search, setSearch] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const totalItems = categories.reduce((a, c) => a + c.items, 0);

    const filtered = itemsData
        .filter(i => !selectedCategory || i.categoryId === selectedCategory)
        .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    const subtotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
    const tax = subtotal * 0.01;
    const grandTotal = subtotal + tax;

    const resetAfterSuccess = () => {
        setCustomerName(""); setMobileNumber(""); clearCart();
    };

    const loadRazorpay = () => new Promise(resolve => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handleMarkFailed = async (orderId) => {
        try { const { markOrderFailed: mof } = await import('../../Service/OrderService.js'); await mof(orderId); }
        catch (e) { console.error(e); }
    };

    const pay = async (mode) => {
        if (!customerName || !mobileNumber) { toast.error("Enter customer details"); return; }
        if (cartItems.length === 0) { toast.error("Cart is empty"); return; }
        setIsProcessing(true);
        try {
            const { createOrder: co } = await import('../../Service/OrderService.js');
            const res = await co({ customerName, phoneNumber: mobileNumber,
                cartItems, subtotal, tax, grandTotal, paymentMethod: mode.toUpperCase() });
            const saved = res.data;

            if (mode === "cash") {
                toast.success("Cash received!");
                deductStockAfterOrder(cartItems);
                setOrderDetails(saved);
                resetAfterSuccess();
            } else {
                const loaded = await loadRazorpay();
                if (!loaded) { toast.error("Razorpay unavailable"); await handleMarkFailed(saved.orderId); return; }
                const rzpRes = await createRazorpayOrder({ amount: grandTotal, currency: "INR" });
                let handled = false;
                const rzp = new window.Razorpay({
                    key: AppConstants.RAZORPAY_KEY_ID,
                    amount: rzpRes.data.amount,
                    currency: rzpRes.data.currency,
                    order_id: rzpRes.data.id,
                    name: "CartIQ Billing",
                    description: `Order #${saved.orderId}`,
                    handler: async (r) => {
                        handled = true;
                        try {
                            const vr = await verifyPayment({
                                razorpayOrderId: r.razorpay_order_id,
                                razorpayPaymentId: r.razorpay_payment_id,
                                razorpaySignature: r.razorpay_signature,
                                orderId: saved.orderId
                            });
                            if (vr.status === 200) {
                                toast.success("Payment successful!");
                                deductStockAfterOrder(cartItems);
                                setOrderDetails({ ...saved, paymentDetails: {
                                    razorpayOrderId: r.razorpay_order_id,
                                    razorpayPaymentId: r.razorpay_payment_id,
                                }});
                                resetAfterSuccess();
                            }
                        } catch (e) { toast.error("Verification error"); }
                    },
                    prefill: { name: customerName, contact: mobileNumber },
                    theme: { color: "#20c997" },
                    modal: { ondismiss: async () => { if (!handled) { await handleMarkFailed(saved.orderId); toast.error("Payment cancelled"); } } }
                });
                rzp.on("payment.failed", async (r) => { handled = false; await handleMarkFailed(saved.orderId); toast.error("Payment failed: " + r.error.description); });
                rzp.open();
            }
        } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
        finally { setIsProcessing(false); }
    };

    return (
        <div className="explore-page">
            {/* ══ LEFT ══ */}
            <div className="explore-left">
                {/* Category strip */}
                <div className="category-strip">
                    <div className="category-strip-title">
                        <i className="bi bi-grid-3x3-gap-fill me-1"></i>Categories
                    </div>
                    <div className="category-scroll">
                        <CategoryPill name="All Items" imgUrl={assets.device}
                            count={totalItems} bgColor="#343a40"
                            isSelected={selectedCategory === ""}
                            onClick={() => setSelectedCategory("")} />
                        {categories.map(c => (
                            <CategoryPill key={c.categoryId} name={c.name}
                                imgUrl={c.imgUrl} count={c.items} bgColor={c.bgColor}
                                isSelected={selectedCategory === c.categoryId}
                                onClick={() => setSelectedCategory(c.categoryId)} />
                        ))}
                    </div>
                </div>

                <div className="explore-divider"></div>

                {/* Search */}
                <div className="explore-search-bar">
                    <div className="explore-search-wrap">
                        <i className="bi bi-search explore-search-icon"></i>
                        <input className="explore-search-input"
                            placeholder="Search items..."
                            value={search}
                            onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Items grid */}
                <div className="items-grid-scroll">
                    <div className="items-grid">
                        {filtered.map(item => (
                            <ItemCard key={item.itemId} item={item}
                                onAdd={() => addToCart({ name: item.name, price: item.price,
                                    quantity: 1, itemId: item.itemId, stockQuantity: item.stockQuantity })} />
                        ))}
                        {filtered.length === 0 && (
                            <div className="items-empty">
                                <i className="bi bi-inbox"></i>
                                No items found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ RIGHT ══ */}
            <div className="explore-right">
                {/* Customer */}
                <div className="right-customer">
                    <div className="right-section-label">
                        <i className="bi bi-person-lines-fill"></i>Customer Details
                    </div>
                    <input className="right-input" placeholder="Customer name"
                        value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    <input className="right-input" placeholder="10-digit mobile number"
                        value={mobileNumber}
                        onChange={e => { const v = e.target.value.replace(/\D/g,''); if(v.length<=10) setMobileNumber(v); }} />
                </div>

                {/* Cart items */}
                <div className="right-cart">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty-msg">
                            <i className="bi bi-cart3"></i>
                            Your cart is empty
                        </div>
                    ) : cartItems.map((item, i) => (
                        <CartRow key={i} item={item}
                            onQtyChange={updateQuantity}
                            onRemove={removeFromCart} />
                    ))}
                </div>

                {/* Summary + pay */}
                <div className="right-summary">
                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-val">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Tax (1%)</span>
                        <span className="summary-val">₹{tax.toFixed(2)}</span>
                    </div>
                    <hr className="summary-divider" />
                    <div className="summary-row">
                        <span className="summary-total-label">Total</span>
                        <span className="summary-total-val">₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <div className="pay-btns">
                        <button className="pay-btn cash" onClick={() => pay("cash")} disabled={isProcessing}>
                            <i className="bi bi-cash-coin"></i>Cash
                        </button>
                        <button className="pay-btn upi" onClick={() => pay("upi")} disabled={isProcessing}>
                            <i className="bi bi-qr-code"></i>UPI
                        </button>
                    </div>
                    <button className="place-order-btn"
                        onClick={() => { setShowPopup(true); }}
                        disabled={isProcessing || !orderDetails}>
                        <i className="bi bi-receipt-cutoff"></i>Place Order / Receipt
                    </button>
                </div>
            </div>

            {showPopup && orderDetails && (
                <ReceiptPopup
                    orderDetails={{ ...orderDetails,
                        razorpayOrderId: orderDetails.paymentDetails?.razorpayOrderId,
                        razorpayPaymentId: orderDetails.paymentDetails?.razorpayPaymentId,
                    }}
                    onClose={() => { setShowPopup(false); setOrderDetails(null); }}
                    onPrint={() => window.print()}
                />
            )}
        </div>
    );
};

export default Explore;
