import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // FORCE VERIFICATION CHECK
  if (user.role === "lawyer" && !user.verified) {
    // Allow access to setup-profile (if needed) but generally block dashboard
    // Assuming /verification-pending is a public route or we handle it in App.jsx to not be protected?
    // Actually, ProtectedRoute is finding its children. If we wrap Dashboard, we block it.
    return <Navigate to="/verification-pending" replace />;
  }

  return children;
}