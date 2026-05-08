import './Explore.css';
import {useContext, useState} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import DisplayCategory from "../../components/DisplayCategory/DisplayCategory.jsx";
import DisplayItems from "../../components/DisplayItems/DisplayItems.jsx";
import CustomerForm from "../../components/CustomerForm/CustomerForm.jsx";
import CartItems from "../../components/CartItems/CartItems.jsx";
import CartSummary from "../../components/CartSummary/CartSummary.jsx";

const Explore = () => {
    const {categories} = useContext(AppContext);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    return (
        <div className="explore-container text-light">
            {/* LEFT: categories + items */}
            <div className="left-column">
                <div className="first-row">
                    <DisplayCategory
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        categories={categories}
                    />
                </div>
                <hr className="horizontal-line" />
                <div className="second-row">
                    <DisplayItems selectedCategory={selectedCategory} />
                </div>
            </div>

            {/* RIGHT: customer form + cart items + summary — NO overlap */}
            <div className="right-column">
                {/* 1. Customer details — fixed top */}
                <div className="customer-form-section">
                    <CustomerForm
                        customerName={customerName}
                        mobileNumber={mobileNumber}
                        setMobileNumber={setMobileNumber}
                        setCustomerName={setCustomerName}
                    />
                </div>

                <hr className="right-divider" />

                {/* 2. Cart items — scrollable middle */}
                <div className="cart-items-section">
                    <CartItems />
                </div>

                {/* 3. Summary — fixed bottom */}
                <div className="cart-summary-section">
                    <CartSummary
                        customerName={customerName}
                        mobileNumber={mobileNumber}
                        setMobileNumber={setMobileNumber}
                        setCustomerName={setCustomerName}
                    />
                </div>
            </div>
        </div>
    );
};

export default Explore;
