import axios from "axios";

const AUTH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/**
 * addCategory — accepts a ready-built FormData that already contains:
 *   - "category"  : JSON string  (set by CategoryForm)
 *   - "file"      : File object  (set by CategoryForm)
 *
 * Do NOT rebuild FormData here — just forward it straight to the backend.
 */
export const addCategory = async (formData) => {
    return await axios.post(
        "http://localhost:8080/api/v1.0/admin/categories",
        formData,
        {
            headers: {
                ...AUTH(),
                // Let axios set Content-Type with the correct boundary automatically
                // Do NOT manually set "Content-Type": "multipart/form-data" — it breaks the boundary
            }
        }
    );
};

export const deleteCategory = async (categoryId) => {
    return await axios.delete(
        `http://localhost:8080/api/v1.0/admin/categories/${categoryId}`,
        { headers: AUTH() }
    );
};

export const fetchCategories = async () => {
    return await axios.get(
        "http://localhost:8080/api/v1.0/categories",
        { headers: AUTH() }
    );
};
