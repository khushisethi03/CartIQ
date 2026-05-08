import { useState } from "react";
import { addUser } from "../../Service/UserService.js";
import toast from "react-hot-toast";
import "./UserForm.css";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const UserForm = ({ setUsers }) => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        role: "ROLE_USER",
    });

    const validate = () => {
        const newErrors = {};
        if (!data.name.trim() || data.name.trim().length < 2)
            newErrors.name = "Name must be at least 2 characters";
        if (!EMAIL_REGEX.test(data.email))
            newErrors.email = "Enter a valid email (e.g. user@example.com)";
        if (data.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await addUser(data);
            setUsers((prev) => [...prev, response.data]);
            toast.success("User added successfully!");
            setData({ name: "", email: "", password: "", role: "ROLE_USER" });
            setErrors({});
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error adding user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="uf-wrapper">
            <div className="uf-header">
                <div className="uf-icon-circle">
                    <i className="bi bi-person-plus-fill"></i>
                </div>
                <div>
                    <h5 className="uf-title">Add New User</h5>
                    <p className="uf-subtitle">Create a system account</p>
                </div>
            </div>

            <form onSubmit={onSubmitHandler} noValidate>
                {/* Name */}
                <div className="uf-field">
                    <label className="uf-label">
                        <i className="bi bi-person me-1"></i>Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        className={`uf-input ${errors.name ? "uf-input-error" : ""}`}
                        placeholder="John Doe"
                        value={data.name}
                        onChange={onChangeHandler}
                        required
                    />
                    {errors.name && <span className="uf-error-msg">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="uf-field">
                    <label className="uf-label">
                        <i className="bi bi-envelope me-1"></i>Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        className={`uf-input ${errors.email ? "uf-input-error" : ""}`}
                        placeholder="user@example.com"
                        value={data.email}
                        onChange={onChangeHandler}
                        required
                    />
                    {errors.email && <span className="uf-error-msg">{errors.email}</span>}
                </div>

                {/* Password */}
                <div className="uf-field">
                    <label className="uf-label">
                        <i className="bi bi-lock me-1"></i>Password
                    </label>
                    <div className="uf-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className={`uf-input uf-input-pw ${errors.password ? "uf-input-error" : ""}`}
                            placeholder="Min 6 characters"
                            value={data.password}
                            onChange={onChangeHandler}
                            required
                        />
                        <button
                            type="button"
                            className="uf-eye-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                    </div>
                    {errors.password && <span className="uf-error-msg">{errors.password}</span>}
                </div>

                {/* Role */}
                <div className="uf-field">
                    <label className="uf-label">
                        <i className="bi bi-shield me-1"></i>Role
                    </label>
                    <div className="uf-role-group">
                        <label className={`uf-role-option ${data.role === "ROLE_USER" ? "uf-role-selected" : ""}`}>
                            <input
                                type="radio"
                                name="role"
                                value="ROLE_USER"
                                checked={data.role === "ROLE_USER"}
                                onChange={onChangeHandler}
                                hidden
                            />
                            <i className="bi bi-person me-1"></i>User
                        </label>
                        <label className={`uf-role-option ${data.role === "ROLE_ADMIN" ? "uf-role-selected uf-role-admin" : ""}`}>
                            <input
                                type="radio"
                                name="role"
                                value="ROLE_ADMIN"
                                checked={data.role === "ROLE_ADMIN"}
                                onChange={onChangeHandler}
                                hidden
                            />
                            <i className="bi bi-shield-check me-1"></i>Admin
                        </label>
                    </div>
                </div>

                <button type="submit" className="uf-submit-btn" disabled={loading}>
                    {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</>
                    ) : (
                        <><i className="bi bi-check-circle me-2"></i>Add User</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default UserForm;