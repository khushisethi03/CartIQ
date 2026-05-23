import Menubar from "./components/Menubar/Menubar.jsx";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import ManageCategory from "./pages/ManageCategory/ManageCategory.jsx";
import ManageUsers from "./pages/ManageUsers/ManageUsers.jsx";
import ManageItems from "./pages/ManageItems/ManageItems.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import {Toaster} from "react-hot-toast";
import Login from "./pages/Login/Login.jsx";
import OrderHistory from "./pages/OrderHistory/OrderHistory.jsx";
import {useContext} from "react";
import {AppContext} from "./context/AppContext.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import Inventory from "./pages/Inventory/Inventory.jsx";
import SalesAnalytics from "./pages/SalesAnalytics/SalesAnalytics.jsx";
import ActivityLog from "./pages/ActivityLog/ActivityLog.jsx";
import Settings from "./components/Settings/Settings.jsx";

const App = () => {
    const location = useLocation();
    const {auth} = useContext(AppContext);

    const LoginRoute = ({element}) => {
        if (auth.token) return <Navigate to="/dashboard" replace />;
        return element;
    };

    // FIX: normalise role before comparing — strips accidental double prefix
    const ProtectedRoute = ({element, allowedRoles}) => {
        if (!auth.token) return <Navigate to="/login" replace />;
        if (allowedRoles) {
            // Normalise: "ROLE_ROLE_ADMIN" → "ROLE_ADMIN", "ADMIN" → "ROLE_ADMIN"
            const role = auth.role
                ? "ROLE_" + auth.role.toUpperCase().replace(/^(ROLE_)+/, "")
                : "";
            if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
        }
        return element;
    };

    return (
        <div>
            {location.pathname !== "/login" && location.pathname !== "/" && <Menubar />}
            <Toaster />
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/category"        element={<ProtectedRoute element={<ManageCategory />}  allowedRoles={["ROLE_ADMIN"]} />} />
                <Route path="/users"           element={<ProtectedRoute element={<ManageUsers />}      allowedRoles={["ROLE_ADMIN"]} />} />
                <Route path="/items"           element={<ProtectedRoute element={<ManageItems />}      allowedRoles={["ROLE_ADMIN"]} />} />
                <Route path="/inventory"       element={<ProtectedRoute element={<Inventory />}        allowedRoles={["ROLE_ADMIN"]} />} />
                <Route path="/sales-analytics" element={<ProtectedRoute element={<SalesAnalytics />}   allowedRoles={["ROLE_ADMIN"]} />} />
                <Route path="/settings"        element={<ProtectedRoute element={<Settings />}         allowedRoles={["ROLE_ADMIN", "ROLE_USER"]} />} />
                <Route path="/login"   element={<LoginRoute element={<Login />} />} />
                <Route path="/orders"  element={<OrderHistory />} />
                <Route path="/activity" element={<ActivityLog />} />
                <Route path="/"        element={<Login />} />
                <Route path="*"        element={<NotFound />} />
            </Routes>
        </div>
    );
};

export default App;
