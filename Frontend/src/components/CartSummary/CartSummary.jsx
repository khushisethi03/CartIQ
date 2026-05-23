import './CartSummary.css';
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import ReceiptPopup from "../ReceiptPopup/ReceiptPopup.jsx";
import { createOrder, deleteOrder } from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import { createRazorpayOrder, verifyPayment } from "../../Service/PaymentService.js";
import { AppConstants } from "../../util/constants.js";

const CartSummary = ({ customerName, mobileNumber, setMobileNumber, setCustomerName }) => {
    const { cartItems, clearCart, deductStockAfterOrder } = useContext(AppContext);

    const [isProcessing, setIsProcessing] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = totalAmount * 0.01;
    const grandTotal = totalAmount + tax;

    const clearAll = () => {
        setCustomerName("");
        setMobileNumber("");
        clearCart();
    };

    const placeOrder = () => {
        setShowPopup(true);
        clearAll();
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            // If already loaded, resolve immediately
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const deleteOrderOnFailure = async (orderId) => {
        try { await deleteOrder(orderId); }
        catch (e) { console.error("Rollback failed:", e); }
    };

    const completePayment = async (paymentMode) => {
        if (!customerName || !mobileNumber) {
            toast.error("Please enter customer details"); return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty"); return;
        }

        const orderData = {
            customerName,
            phoneNumber: mobileNumber,
            cartItems,
            subtotal: totalAmount,
            tax,
            grandTotal,
            paymentMethod: paymentMode.toUpperCase()
        };

        setIsProcessing(true);
        try {
            const response = await createOrder(orderData);
            const savedData = response.data;

            if (response.status === 201 && paymentMode === "cash") {
                toast.success("Cash received");
                deductStockAfterOrder(cartItems);   // update inventory in UI
                setOrderDetails(savedData);

            } else if (response.status === 201 && paymentMode === "upi") {
                const razorpayLoaded = await loadRazorpayScript();
                if (!razorpayLoaded) {
                    toast.error("Unable to load Razorpay — check internet connection");
                    await deleteOrderOnFailure(savedData.orderId);
                    return;
                }

                const rzpOrderResp = await createRazorpayOrder({
                    amount: grandTotal, currency: "INR"
                });

                const options = {
                    // FIX: AppConstants now has the real key (was "your_key_id")
                    key: AppConstants.RAZORPAY_KEY_ID,
                    amount: rzpOrderResp.data.amount,
                    currency: rzpOrderResp.data.currency,
                    order_id: rzpOrderResp.data.id,
                    name: "CartIQ Billing",
                    description: `Order #${savedData.orderId}`,
                    handler: async (response) => {
                        await verifyPaymentHandler(response, savedData);
                    },
                    prefill: { name: customerName, contact: mobileNumber },
                    theme: { color: "#20c997" },
                    modal: {
                        ondismiss: async () => {
                            await deleteOrderOnFailure(savedData.orderId);
                            toast.error("Payment cancelled");
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.on("payment.failed", async (resp) => {
                    await deleteOrderOnFailure(savedData.orderId);
                    toast.error("Payment failed: " + resp.error.description);
                });
                rzp.open();
            }
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message || "Payment processing failed";
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const verifyPaymentHandler = async (response, savedOrder) => {
        const paymentData = {
            razorpayOrderId:  response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: savedOrder.orderId
        };
        try {
            const paymentResponse = await verifyPayment(paymentData);
            if (paymentResponse.status === 200) {
                toast.success("Payment successful!");
                deductStockAfterOrder(cartItems);   // update inventory in UI
                setOrderDetails({
                    ...savedOrder,
                    paymentDetails: {
                        razorpayOrderId:  response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    }
                });
            } else {
                toast.error("Payment verification failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Payment verification failed");
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
                    onClick={() => completePayment("cash")}
                    disabled={isProcessing}>
                    {isProcessing ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</> : "Cash"}
                </button>
                <button className="btn btn-primary flex-grow-1"
                    onClick={() => completePayment("upi")}
                    disabled={isProcessing}>
                    {isProcessing ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</> : "UPI"}
                </button>
            </div>
            <div className="d-flex mt-2">
                <button className="btn btn-warning flex-grow-1"
                    onClick={placeOrder}
                    disabled={isProcessing || !orderDetails}>
                    Place Order
                </button>
            </div>

            {showPopup && orderDetails && (
                <ReceiptPopup
                    orderDetails={{
                        ...orderDetails,
                        razorpayOrderId:  orderDetails.paymentDetails?.razorpayOrderId,
                        razorpayPaymentId: orderDetails.paymentDetails?.razorpayPaymentId,
                    }}
                    onClose={() => setShowPopup(false)}
                    onPrint={() => window.print()}
                />
            )}
        </div>
    );
};

export default CartSummary;
