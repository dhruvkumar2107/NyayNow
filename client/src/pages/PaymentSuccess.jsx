import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "lawyer") {
      navigate("/lawyer/dashboard");
    } else {
      navigate("/client/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful
        </h1>

        <p className="text-gray-500 mb-8">
          Your subscription has been activated successfully.
        </p>

        <button
          onClick={goToDashboard}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
