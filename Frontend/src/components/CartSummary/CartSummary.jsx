import './CartSummary.css';
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import ReceiptPopup from "../ReceiptPopup/ReceiptPopup.jsx";
import { createOrder, markOrderFailed } from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import { createRazorpayOrder, verifyPayment } from "../../Service/PaymentService.js";
import { AppConstants } from "../../util/constants.js";

const CartSummary = ({ customerName, mobileNumber, setMobileNumber, setCustomerName }) => {
    const { cartItems, clearCart, deductStockAfterOrder } = useContext(AppContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const totalAmount = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
    const tax = totalAmount * 0.01;
    const grandTotal = totalAmount + tax;

    // FIX 1: Reset customer form + cart immediately after successful payment
    const resetAfterSuccess = () => {
        setCustomerName("");
        setMobileNumber("");
        clearCart();
    };

    const loadRazorpayScript = () => new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    // FIX 2: Mark FAILED instead of deleting
    const handlePaymentFailed = async (orderId) => {
        try { await markOrderFailed(orderId); }
        catch (e) { console.error("Failed to mark order as failed:", e); }
    };

    const completePayment = async (paymentMode) => {
        if (!customerName || !mobileNumber) {
            toast.error("Please enter customer details"); return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty"); return;
        }

        const orderData = {
            customerName, phoneNumber: mobileNumber,
            cartItems, subtotal: totalAmount, tax, grandTotal,
            paymentMethod: paymentMode.toUpperCase()
        };

        setIsProcessing(true);
        try {
            const response = await createOrder(orderData);
            const savedData = response.data;

            if (response.status === 201 && paymentMode === "cash") {
                toast.success("Cash received!");
                deductStockAfterOrder(cartItems);
                setOrderDetails(savedData);
                resetAfterSuccess(); // FIX 1: clear cart right away

            } else if (response.status === 201 && paymentMode === "upi") {
                const loaded = await loadRazorpayScript();
                if (!loaded) {
                    toast.error("Unable to load Razorpay — check internet");
                    await handlePaymentFailed(savedData.orderId);
                    return;
                }

                const rzpResp = await createRazorpayOrder({ amount: grandTotal, currency: "INR" });

                let paymentHandlerCalled = false;

                const options = {
                    key: AppConstants.RAZORPAY_KEY_ID,
                    amount: rzpResp.data.amount,
                    currency: rzpResp.data.currency,
                    order_id: rzpResp.data.id,
                    name: "CartIQ Billing",
                    description: `Order #${savedData.orderId}`,
                    handler: async (rzpResponse) => {
                        paymentHandlerCalled = true;
                        await verifyPaymentHandler(rzpResponse, savedData);
                    },
                    prefill: { name: customerName, contact: mobileNumber },
                    theme: { color: "#20c997" },
                    modal: {
                        ondismiss: async () => {
                            if (!paymentHandlerCalled) {
                                // FIX 2: Mark FAILED, not delete
                                await handlePaymentFailed(savedData.orderId);
                                toast.error("Payment cancelled");
                            }
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on("payment.failed", async (resp) => {
                    paymentHandlerCalled = false;
                    // FIX 2: Mark FAILED, not delete
                    await handlePaymentFailed(savedData.orderId);
                    toast.error("Payment failed: " + resp.error.description);
                });
                rzp.open();
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Payment processing failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const verifyPaymentHandler = async (response, savedOrder) => {
        const paymentData = {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: savedOrder.orderId
        };
        try {
            const res = await verifyPayment(paymentData);
            if (res.status === 200) {
                toast.success("Payment successful!");
                deductStockAfterOrder(cartItems);
                setOrderDetails({ ...savedOrder, paymentDetails: {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                }});
                resetAfterSuccess(); // FIX 1: clear cart right away for UPI too
            } else {
                toast.error("Payment verification failed");
            }
        } catch (e) {
            console.error(e);
            toast.error("Payment verification error — check Order History");
        }
    };

    return (
        <div className="mt-2">
            <div className="cart-summary-details">
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Item:</span>
                    <span className="text-light">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span className="text-light">Tax (1%):</span>
                    <span className="text-light">₹{tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                    <span className="text-light fw-semibold">Total:</span>
                    <span className="text-warning fw-bold">₹{grandTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="d-flex gap-2">
                <button className="btn btn-success flex-grow-1"
                    onClick={() => completePayment("cash")} disabled={isProcessing}>
                    {isProcessing
                        ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                        : "Cash"}
                </button>
                <button className="btn btn-primary flex-grow-1"
                    onClick={() => completePayment("upi")} disabled={isProcessing}>
                    {isProcessing
                        ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                        : "UPI"}
                </button>
            </div>
            <div className="d-flex mt-2">
                <button className="btn btn-warning flex-grow-1"
                    onClick={() => { setShowPopup(true); }}
                    disabled={isProcessing || !orderDetails}>
                    Place Order
                </button>
            </div>

            {showPopup && orderDetails && (
                <ReceiptPopup
                    orderDetails={{
                        ...orderDetails,
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

export default CartSummary;
