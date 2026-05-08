import { useContext, useState } from "react";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import { addItem } from "../../Service/ItemService.js";
import "./ItemForm.css";

const ItemForm = () => {
    const { categories, setItemsData, itemsData, setCategories } = useContext(AppContext);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [errors, setErrors] = useState({});

    const [data, setData] = useState({
        name: "",
        categoryId: "",
        price: "",
        description: "",
    });

    const validate = () => {
        const errs = {};
        if (!data.name.trim()) errs.name = "Item name is required";
        if (!data.categoryId) errs.categoryId = "Please select a category";
        if (!data.price || parseFloat(data.price) <= 0) errs.price = "Enter a valid price";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) setImage(file);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!image) { toast.error("Please upload an item image"); return; }
        if (!validate()) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("item", JSON.stringify(data));
        formData.append("file", image);
        try {
            const response = await addItem(formData);
            if (response.status === 201) {
                setItemsData([...itemsData, response.data]);
                setCategories(prev =>
                    prev.map(c => c.categoryId === data.categoryId ? { ...c, items: c.items + 1 } : c)
                );
                toast.success("Item added!");
                setData({ name: "", description: "", price: "", categoryId: "" });
                setImage(null);
                setErrors({});
            }
        } catch (err) {
            console.error(err);
            toast.error("Unable to add item");
        } finally {
            setLoading(false);
        }
    };

    const selectedCategory = categories.find(c => c.categoryId === data.categoryId);

    return (
        <div className="if-wrapper">
            <div className="if-header">
                <div className="if-icon-box">
                    <i className="bi bi-box-seam-fill"></i>
                </div>
                <div>
                    <h5 className="if-title">Add New Item</h5>
                    <p className="if-subtitle">Create a product listing</p>
                </div>
            </div>

            <form onSubmit={onSubmitHandler}>
                {/* Image upload */}
                <div
                    className={`if-upload-zone ${dragOver ? "if-drag-over" : ""} ${image ? "if-has-image" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("itemImage").click()}
                >
                    {image ? (
                        <>
                            <img src={URL.createObjectURL(image)} alt="preview" className="if-preview-img" />
                            <div className="if-preview-overlay"><i className="bi bi-arrow-repeat me-1"></i>Change</div>
                        </>
                    ) : (
                        <div className="if-upload-placeholder">
                            <i className="bi bi-image if-upload-icon"></i>
                            <p className="if-upload-text">Click or drag image here</p>
                            <p className="if-upload-hint">PNG, JPG, WEBP</p>
                        </div>
                    )}
                    <input type="file" id="itemImage" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
                </div>

                {/* Name */}
                <div className="if-field">
                    <label className="if-label"><i className="bi bi-tag me-1"></i>Item Name</label>
                    <input
                        type="text" name="name" className={`if-input ${errors.name ? "if-input-error" : ""}`}
                        placeholder="Product name" value={data.name} onChange={onChangeHandler} required
                    />
                    {errors.name && <span className="if-error">{errors.name}</span>}
                </div>

                {/* Category */}
                <div className="if-field">
                    <label className="if-label"><i className="bi bi-grid me-1"></i>Category</label>
                    <div className="if-select-wrapper">
                        <select
                            name="categoryId"
                            className={`if-input if-select ${errors.categoryId ? "if-input-error" : ""}`}
                            value={data.categoryId}
                            onChange={onChangeHandler}
                            required
                        >
                            <option value="">— Select Category —</option>
                            {categories.map((cat, i) => (
                                <option key={i} value={cat.categoryId}>{cat.name}</option>
                            ))}
                        </select>
                        {selectedCategory && (
                            <span className="if-cat-dot" style={{ background: selectedCategory.bgColor }}></span>
                        )}
                    </div>
                    {errors.categoryId && <span className="if-error">{errors.categoryId}</span>}
                </div>

                {/* Price */}
                <div className="if-field">
                    <label className="if-label"><i className="bi bi-currency-rupee me-1"></i>Price (₹)</label>
                    <input
                        type="number" name="price" min="0" step="0.01"
                        className={`if-input ${errors.price ? "if-input-error" : ""}`}
                        placeholder="0.00" value={data.price} onChange={onChangeHandler} required
                    />
                    {errors.price && <span className="if-error">{errors.price}</span>}
                </div>

                {/* Description */}
                <div className="if-field">
                    <label className="if-label"><i className="bi bi-text-left me-1"></i>Description <span className="if-optional">(optional)</span></label>
                    <textarea
                        name="description" className="if-input if-textarea" rows={3}
                        placeholder="Short description of the item..."
                        value={data.description} onChange={onChangeHandler}
                    />
                </div>

                <button type="submit" className="if-submit-btn" disabled={loading}>
                    {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                        : <><i className="bi bi-plus-circle me-2"></i>Add Item</>
                    }
                </button>
            </form>
        </div>
    );
};

export default ItemForm;