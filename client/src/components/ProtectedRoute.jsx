import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (role && user.role !== role) {
      router.replace("/");
    } else if (user.role === "lawyer" && !user.verified) {
      router.replace("/verification-pending");
    }
  }, [user, role, router]);

  if (!user || (role && user.role !== role) || (user.role === "lawyer" && !user.verified)) {
    return null;
  }

  return children;
}