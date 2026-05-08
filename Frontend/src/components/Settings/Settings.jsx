import { useState, useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";
import "./Settings.css";

const Settings = () => {
    const { auth } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState({
        displayName: "",
        email: "",
    });
    const [pwData, setPwData] = useState({ current: "", newPw: "", confirm: "" });
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
    const [prefData, setPrefData] = useState({
        taxRate: "1",
        currency: "INR",
        lowStockAlert: "5",
    });

    const handleProfileSave = (e) => {
        e.preventDefault();
        toast.success("Profile updated (demo — connect to API)");
    };

    const handlePasswordSave = (e) => {
        e.preventDefault();
        if (pwData.newPw !== pwData.confirm) {
            toast.error("New passwords don't match");
            return;
        }
        if (pwData.newPw.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        toast.success("Password changed (demo — connect to API)");
        setPwData({ current: "", newPw: "", confirm: "" });
    };

    const handlePrefSave = (e) => {
        e.preventDefault();
        localStorage.setItem("app_prefs", JSON.stringify(prefData));
        toast.success("Preferences saved!");
    };

    const tabs = [
        { id: "profile", icon: "bi-person-circle", label: "Profile" },
        { id: "password", icon: "bi-lock", label: "Password" },
        { id: "preferences", icon: "bi-sliders", label: "Preferences" },
        { id: "about", icon: "bi-info-circle", label: "About" },
    ];

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2 className="settings-title"><i className="bi bi-gear-fill me-2"></i>Settings</h2>
                <p className="settings-subtitle">Manage your account and preferences</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`settings-tab-btn ${activeTab === t.id ? "settings-tab-active" : ""}`}
                            onClick={() => setActiveTab(t.id)}
                        >
                            <i className={`bi ${t.icon} me-2`}></i>{t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="settings-content">

                    {/* Profile */}
                    {activeTab === "profile" && (
                        <div className="settings-panel">
                            <h5 className="settings-panel-title">Profile Information</h5>
                            <div className="settings-role-chip">
                                <i className="bi bi-shield-check me-1"></i>
                                {auth.role?.replace("ROLE_", "") || "User"}
                            </div>
                            <form onSubmit={handleProfileSave}>
                                <div className="settings-field">
                                    <label className="settings-label">Display Name</label>
                                    <input
                                        type="text"
                                        className="settings-input"
                                        placeholder="Your display name"
                                        value={profileData.displayName}
                                        onChange={e => setProfileData(p => ({ ...p, displayName: e.target.value }))}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="settings-input"
                                        placeholder="your@email.com"
                                        value={profileData.email}
                                        onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                                    />
                                </div>
                                <button type="submit" className="settings-save-btn">
                                    <i className="bi bi-check-circle me-2"></i>Save Changes
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Password */}
                    {activeTab === "password" && (
                        <div className="settings-panel">
                            <h5 className="settings-panel-title">Change Password</h5>
                            <form onSubmit={handlePasswordSave}>
                                {[
                                    { key: "current", label: "Current Password", placeholder: "Enter current password" },
                                    { key: "newPw", label: "New Password", placeholder: "Min 6 characters" },
                                    { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
                                ].map(f => (
                                    <div className="settings-field" key={f.key}>
                                        <label className="settings-label">{f.label}</label>
                                        <div className="settings-pw-group">
                                            <input
                                                type={showPw[f.key] ? "text" : "password"}
                                                className="settings-input"
                                                placeholder={f.placeholder}
                                                value={pwData[f.key]}
                                                onChange={e => setPwData(p => ({ ...p, [f.key]: e.target.value }))}
                                            />
                                            <button
                                                type="button"
                                                className="settings-eye-btn"
                                                onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                                            >
                                                <i className={`bi ${showPw[f.key] ? "bi-eye-slash" : "bi-eye"}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button type="submit" className="settings-save-btn">
                                    <i className="bi bi-lock me-2"></i>Update Password
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Preferences */}
                    {activeTab === "preferences" && (
                        <div className="settings-panel">
                            <h5 className="settings-panel-title">App Preferences</h5>
                            <form onSubmit={handlePrefSave}>
                                <div className="settings-field">
                                    <label className="settings-label">Tax Rate (%)</label>
                                    <input
                                        type="number" min="0" max="100" step="0.1"
                                        className="settings-input"
                                        value={prefData.taxRate}
                                        onChange={e => setPrefData(p => ({ ...p, taxRate: e.target.value }))}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Currency</label>
                                    <select
                                        className="settings-input"
                                        value={prefData.currency}
                                        onChange={e => setPrefData(p => ({ ...p, currency: e.target.value }))}
                                    >
                                        <option value="INR">₹ Indian Rupee (INR)</option>
                                        <option value="USD">$ US Dollar (USD)</option>
                                        <option value="EUR">€ Euro (EUR)</option>
                                    </select>
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Low Stock Alert Threshold</label>
                                    <input
                                        type="number" min="0"
                                        className="settings-input"
                                        value={prefData.lowStockAlert}
                                        onChange={e => setPrefData(p => ({ ...p, lowStockAlert: e.target.value }))}
                                    />
                                    <small className="settings-hint">Alert when stock ≤ this value</small>
                                </div>
                                <button type="submit" className="settings-save-btn">
                                    <i className="bi bi-check-circle me-2"></i>Save Preferences
                                </button>
                            </form>
                        </div>
                    )}

                    {/* About */}
                    {activeTab === "about" && (
                        <div className="settings-panel">
                            <h5 className="settings-panel-title">About CartIQ</h5>
                            <div className="settings-about-card">
                                <div className="settings-about-logo">
                                    <i className="bi bi-cart-check-fill"></i>
                                </div>
                                <h4 className="text-white mb-1">CartIQ Billing Software</h4>
                                <p className="text-muted mb-3">Retail POS & Billing System</p>
                                <div className="settings-about-grid">
                                    {[
                                        { label: "Version", value: "1.0.0" },
                                        { label: "Backend", value: "Spring Boot 3.4.4" },
                                        { label: "Frontend", value: "React + Vite" },
                                        { label: "Database", value: "MySQL" },
                                    ].map(r => (
                                        <div className="settings-about-row" key={r.label}>
                                            <span className="settings-about-label">{r.label}</span>
                                            <span className="settings-about-value">{r.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Settings;