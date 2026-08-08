import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Wrap a page element: <ProtectedRoute roles={["ngo","admin"]}><NGODashboard/></ProtectedRoute>
 * Omit `roles` to allow any authenticated user.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
