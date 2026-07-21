import './Menubar.css';
import {assets} from "../../assets/assets.js";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useContext} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import useResponsive from "../../hooks/useResponsive";

const normaliseRole = (role = "") =>
    "ROLE_" + role.toUpperCase().replace(/^(ROLE_)+/, "");

const Menubar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {setAuthData, auth} = useContext(AppContext);

   const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    setAuthData(null, null, null);

    navigate("/login");
};

    const isActive = (path) => location.pathname === path;
    const isAdmin = normaliseRole(auth.role) === "ROLE_ADMIN";
    const { isTablet, isMobile } = useResponsive();

    const compactNav = isTablet || isMobile;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <a className="navbar-brand" href="#">
                <img src={assets.logo} alt="Logo" height="40" />
            </a>
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
             <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse p-2" id="navbarNav">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link className={`nav-link nav-link-custom ${isActive('/dashboard') ? 'active-link' : ''}`} to="/dashboard">
                            <i className="bi bi-speedometer2 me-1"></i>Dashboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link nav-link-custom ${isActive('/explore') ? 'active-link' : ''}`} to="/explore">
                            <i className="bi bi-shop me-1"></i>Explore
                        </Link>
                    </li>
                    {isAdmin && (<>
                        <li className="nav-item">
                            <Link className={`nav-link nav-link-custom ${isActive('/items') ? 'active-link' : ''}`} to="/items">
                            <>
                             <i className="bi bi-box-seam me-1"></i>
                                {compactNav ? "Items" : "Manage Items"}
                            </>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link nav-link-custom ${isActive('/category') ? 'active-link' : ''}`} to="/category">
                            <>
                            <i className="bi bi-tag me-1"></i>
                                {compactNav ? "Categories" : "Manage Categories"}
                            </>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link nav-link-custom ${isActive('/users') ? 'active-link' : ''}`} to="/users">
                            <>
                            <i className="bi bi-people me-1"></i>
                                {compactNav ? "Users" : "Manage Users"}
                            </>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link nav-link-custom ${isActive('/inventory') ? 'active-link' : ''}`} to="/inventory">
                                <i className="bi bi-boxes me-1"></i>Inventory
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link nav-link-custom ${isActive('/sales-analytics') ? 'active-link' : ''}`} to="/sales-analytics">
                            <>
                            <i className="bi bi-graph-up-arrow me-1"></i>
                                {compactNav ? "Analytics" : "Sales Analytics"}
                            </>
                            </Link>
                        </li>
                    </>)}
                    <li className="nav-item">
                        <Link className={`nav-link nav-link-custom ${isActive('/orders') ? 'active-link' : ''}`} to="/orders">
                            <i className="bi bi-receipt me-1"></i>Order History
                        </Link>
                    </li>
                </ul>
                <ul className="navbar-nav ms-auto me-3">
                    <li className="nav-item dropdown">
                        <a href="#" className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                            id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <div className="avatar-circle"><i className="bi bi-person-fill"></i></div>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end dropdown-dark-custom" aria-labelledby="navbarDropdown">
                            <li>
                                <div className="dropdown-header-info px-3 py-2 border-bottom border-secondary">
                                    <div className="fw-semibold text-white">
                                        {auth.name || (isAdmin ? "Admin" : "User")}
                                    </div>
                                    <small className="text-muted">{normaliseRole(auth.role).replace("ROLE_", "")}</small>
                                </div>
                            </li>
                            <li><Link to="/settings" className="dropdown-item dropdown-item-custom"><i className="bi bi-gear me-2"></i>Settings</Link></li>
                            <li><Link to="/activity" className="dropdown-item dropdown-item-custom"><i className="bi bi-clock-history me-2"></i>Activity log</Link></li>
                            <li><hr className="dropdown-divider border-secondary" /></li>
                            <li><a href="#!" className="dropdown-item dropdown-item-custom text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Menubar;
