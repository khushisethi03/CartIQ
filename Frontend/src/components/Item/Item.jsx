import './Item.css';
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";

const Item = ({ itemName, itemPrice, itemImage, itemId, stockQuantity }) => {
    const { addToCart } = useContext(AppContext);

    // Blocked only when stockQuantity is a real number AND equals 0 or less
    const isOutOfStock = typeof stockQuantity === "number" && stockQuantity <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        addToCart({
            name: itemName,
            price: itemPrice,
            quantity: 1,
            itemId: itemId,
            stockQuantity: stockQuantity,
        });
    };

    return (
        <div className={`p-3 bg-dark rounded shadow-sm h-100 d-flex align-items-center item-card ${isOutOfStock ? 'item-card-oos' : ''}`}>
            <div style={{ position: "relative", marginRight: "15px" }}>
                <img src={itemImage} alt={itemName} className="item-image" />
            </div>

            <div className="flex-grow-1 ms-2">
                <h6 className="mb-1 text-light">{itemName}</h6>
                <p className="mb-0 fw-bold text-light">₹{itemPrice}</p>
                {isOutOfStock && (
                    <span className="badge bg-danger mt-1" style={{ fontSize: '0.68rem' }}>
                        Out of Stock
                    </span>
                )}
            </div>

            <div className="d-flex flex-column justify-content-between align-items-center ms-3" style={{ height: "100%" }}>
                <i className={`bi bi-cart-plus fs-4 ${isOutOfStock ? 'text-secondary' : 'text-warning'}`}></i>
                <button
                    className="btn btn-success btn-sm"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? "Out of stock" : "Add to cart"}
                    style={isOutOfStock ? { opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                >
                    <i className="bi bi-plus"></i>
                </button>
            </div>
        </div>
    );
};

export default Item;
