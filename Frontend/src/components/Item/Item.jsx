import './Item.css';
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";

const Item = ({ itemName, itemPrice, itemImage, itemId, stockQuantity }) => {
    const { addToCart } = useContext(AppContext);

    const isOutOfStock = typeof stockQuantity === "number" && stockQuantity <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({ name: itemName, price: itemPrice, quantity: 1, itemId });
    };

    return (
        <div className={`p-2 bg-dark rounded shadow-sm h-100 d-flex align-items-center gap-2 item-card ${isOutOfStock ? 'item-card-oos' : ''}`}>

            {/* Image — fixed size, never shrinks */}
            <img src={itemImage} alt={itemName} className="item-image" />

            {/* Name + price — flex grow, min-width:0 prevents overflow */}
            <div className="item-info">
                <div className="item-name">{itemName}</div>
                <div className="item-price">₹{itemPrice}</div>
                {isOutOfStock && (
                    <span className="badge bg-danger mt-1" style={{ fontSize: '0.65rem' }}>
                        Out of Stock
                    </span>
                )}
            </div>

            {/* Cart icon + Add button — fixed width, never drifts */}
            <div className="item-actions">
                <i className={`bi bi-cart-plus item-cart-icon ${isOutOfStock ? 'text-secondary' : 'text-warning'}`}></i>
                <button
                    className="btn btn-success item-add-btn"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? "Out of stock" : "Add to cart"}
                    style={isOutOfStock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                >
                    <i className="bi bi-plus"></i>
                </button>
            </div>
        </div>
    );
};

export default Item;
