import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { addCategory } from "../../Service/CategoryService.js";
import { AppContext } from "../../context/AppContext.jsx";
import "./CategoryForm.css";

const CategoryForm = () => {
    const { setCategories, categories } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const [data, setData] = useState({
        name: "",
        description: "",
        bgColor: "#1e3a5f",
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) setImage(file);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!image) { toast.error("Please upload a category image"); return; }
        if (!data.name.trim()) { toast.error("Category name is required"); return; }

        setLoading(true);

        // Build FormData correctly:
        // "category" → JSON string of the data object
        // "file"     → the actual File object (NOT a FormData, NOT JSON)
        const formData = new FormData();
        formData.append("category", JSON.stringify(data));
        formData.append("file", image);   // image is the raw File from state

        try {
            const response = await addCategory(formData);
            if (response.status === 201) {
                setCategories([response.data, ...categories]);
                toast.success("Category added successfully!");
                setData({ name: "", description: "", bgColor: "#1e3a5f" });
                setImage(null);
            }
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || "Error adding category";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cf-wrapper">
            <div className="cf-header">
                <div className="cf-icon-box">
                    <i className="bi bi-tag-fill"></i>
                </div>
                <div>
                    <h5 className="cf-title">New Category</h5>
                    <p className="cf-subtitle">Add a product category</p>
                </div>
            </div>

            <form onSubmit={onSubmitHandler}>
                {/* Image upload */}
                <div
                    className={`cf-upload-zone ${dragOver ? "cf-drag-over" : ""} ${image ? "cf-has-image" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleImageDrop}
                    onClick={() => document.getElementById("catImage").click()}
                >
                    {image ? (
                        <>
                            <img src={URL.createObjectURL(image)} alt="preview" className="cf-preview-img" />
                            <div className="cf-preview-overlay">
                                <i className="bi bi-arrow-repeat me-1"></i>Change
                            </div>
                        </>
                    ) : (
                        <div className="cf-upload-placeholder">
                            <i className="bi bi-cloud-arrow-up-fill cf-upload-icon"></i>
                            <p className="cf-upload-text">Click or drag image here</p>
                            <p className="cf-upload-hint">PNG, JPG up to 5MB</p>
                        </div>
                    )}
                    <input
                        type="file"
                        id="catImage"
                        accept="image/*"
                        hidden
                        onChange={e => setImage(e.target.files[0])}
                    />
                </div>

                {/* Name */}
                <div className="cf-field">
                    <label className="cf-label"><i className="bi bi-fonts me-1"></i>Category Name</label>
                    <input
                        type="text" name="name" className="cf-input"
                        placeholder="e.g. Electronics, Clothing..."
                        value={data.name} onChange={onChangeHandler} required
                    />
                </div>

                {/* Description */}
                <div className="cf-field">
                    <label className="cf-label"><i className="bi bi-text-left me-1"></i>Description</label>
                    <textarea
                        name="description" className="cf-input cf-textarea"
                        placeholder="Brief description of this category..."
                        rows={3} value={data.description} onChange={onChangeHandler}
                    />
                </div>

                {/* Color */}
                <div className="cf-field">
                    <label className="cf-label"><i className="bi bi-palette me-1"></i>Card Color</label>
                    <div className="cf-color-row">
                        <input
                            type="color" name="bgColor" className="cf-color-picker"
                            value={data.bgColor} onChange={onChangeHandler}
                        />
                        <div className="cf-color-preview" style={{ background: data.bgColor }}>
                            <span className="text-white fw-semibold" style={{ fontSize: "0.78rem" }}>Preview</span>
                        </div>
                        <span className="cf-color-hex">{data.bgColor}</span>
                    </div>
                </div>

                <button type="submit" className="cf-submit-btn" disabled={loading}>
                    {loading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                        : <><i className="bi bi-plus-circle me-2"></i>Add Category</>
                    }
                </button>
            </form>
        </div>
    );
};

export default CategoryForm;
