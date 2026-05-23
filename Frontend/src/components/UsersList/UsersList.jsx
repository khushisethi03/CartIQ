import { useState } from "react";
import { deleteUser } from "../../Service/UserService.js";
import toast from "react-hot-toast";
import "./UsersList.css";

const normaliseRole = (role = "") => role.replace("ROLE_", "").toUpperCase();

const ROLE_CONFIG = {
    ADMIN: { label: "Admin", color: "#ffc107", bg: "rgba(255,193,7,0.12)", icon: "bi-shield-fill-check" },
    USER:  { label: "User",  color: "#20c997", bg: "rgba(32,201,151,0.12)", icon: "bi-person-fill" },
};

const getInitials = (name) =>
    name ? name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "?";

const UsersList = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        setDeletingId(userId);
        try {
            await deleteUser(userId);
            setUsers(prev => prev.filter(u => u.userId !== userId));
            toast.success("User deleted");
        } catch (e) {
            console.error(e);
            toast.error("Unable to delete user");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="ul-wrapper">
            <div className="ul-search-bar">
                <i className="bi bi-search ul-search-icon"></i>
                <input
                    type="text"
                    className="ul-search-input"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="ul-clear-btn" onClick={() => setSearchTerm("")}>
                        <i className="bi bi-x"></i>
                    </button>
                )}
            </div>

            <div className="ul-count">
                <span>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="ul-list">
                {filtered.length === 0 && (
                    <div className="ul-empty">
                        <i className="bi bi-people"></i>
                        <p>No users found</p>
                    </div>
                )}
                {filtered.map((user, i) => {
                    const key = normaliseRole(user.role);
                    const roleInfo = ROLE_CONFIG[key] || ROLE_CONFIG["USER"];
                    return (
                        <div className="ul-card" key={user.userId || i}>
                            <div className="ul-avatar"
                                style={{ background: `linear-gradient(135deg, ${roleInfo.color}88, ${roleInfo.color}44)` }}>
                                {getInitials(user.name)}
                            </div>
                            <div className="ul-info">
                                <div className="ul-name">{user.name}</div>
                                <div className="ul-email">
                                    <i className="bi bi-envelope me-1"></i>{user.email}
                                </div>
                            </div>
                            <div className="ul-role-badge"
                                style={{ color: roleInfo.color, background: roleInfo.bg }}>
                                <i className={`bi ${roleInfo.icon} me-1`}></i>
                                {roleInfo.label}
                            </div>
                            <button
                                className="ul-delete-btn"
                                onClick={() => handleDelete(user.userId)}
                                disabled={deletingId === user.userId}
                                title="Delete user"
                            >
                                {deletingId === user.userId
                                    ? <span className="spinner-border spinner-border-sm"></span>
                                    : <i className="bi bi-trash3"></i>
                                }
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UsersList;
