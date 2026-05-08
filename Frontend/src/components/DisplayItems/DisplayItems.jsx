import './DisplayItems.css';
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import Item from "../Item/Item.jsx";
import SearchBox from "../SearchBox/SearchBox.jsx";

// Helper: true if item is definitively out of stock (stockQuantity is a number AND <= 0)
const isItemOOS = (item) =>
    typeof item.stockQuantity === "number" && item.stockQuantity <= 0;

const DisplayItems = ({ selectedCategory }) => {
    const { itemsData } = useContext(AppContext);
    const [searchText, setSearchText] = useState("");

    const filteredItems = itemsData
        .filter(item => !selectedCategory || item.categoryId === selectedCategory)
        .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));

    const inStock   = filteredItems.filter(item => !isItemOOS(item));
    const outOfStock = filteredItems.filter(item =>  isItemOOS(item));

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div></div>
                <SearchBox onSearch={setSearchText} />
            </div>

            <div className="row g-3">
                {/* In-stock items */}
                {inStock.map((item, index) => (
                    <div key={`in-${index}`} className="col-md-4 col-sm-6">
                        <Item
                            itemName={item.name}
                            itemPrice={item.price}
                            itemImage={item.imgUrl}
                            itemId={item.itemId}
                            stockQuantity={item.stockQuantity}
                        />
                    </div>
                ))}

                {/* Out-of-stock items — dimmed, no add button */}
                {outOfStock.map((item, index) => (
                    <div key={`out-${index}`} className="col-md-4 col-sm-6">
                        <div className="di-oos-card">
                            <img src={item.imgUrl} alt={item.name} className="di-oos-img" />
                            <div className="di-oos-overlay">
                                <span className="di-oos-badge">
                                    <i className="bi bi-x-circle me-1"></i>Out of Stock
                                </span>
                            </div>
                            <div className="di-oos-info">
                                <span className="di-oos-name">{item.name}</span>
                                <span className="di-oos-price">₹{item.price}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="col-12 text-center text-muted py-5">
                        <i className="bi bi-inbox fs-1"></i>
                        <p className="mt-2">No items found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplayItems;
