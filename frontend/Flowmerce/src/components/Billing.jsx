import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

const PRIMARY_COLOR = "#ff5c00";

const inputClasses =
  "bg-[#F49CAC]/30 px-4 py-2 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-600 w-full";

const plans = {
  basic: {
    name: "Basic",
    price: 1500,
    features: [
      "500 products inventory handling",
      "Order Tracking",
      "One business",
      "1 Staff user",
    ],
  },
  pro: {
    name: "Pro",
    price: 2000,
    features: [
      "1000 products inventory handling",
      "2–3 staff users",
      "AI advisor (limited)",
      "24/7 support",
    ],
  },
  premium: {
    name: "Premium",
    price: 3500,
    features: [
      "Unlimited products inventory",
      "Unlimited staff users",
      "AI advisor (unlimited)",
      "Priority support",
    ],
  },
};

function Billing() {
  const location = useLocation();
  const selectedPlanCode = location.state?.plan || "basic";
  const selectedPlan = plans[selectedPlanCode];

  const [email, setEmail] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mpesaCode || !email) {
      toast.error("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      await api.post("/subscriptions/", {
        plan: selectedPlanCode,
        amount: selectedPlan.price,
        mpesa_code: mpesaCode,
        email,
        duration_days: 30,
      });

      toast.success("Payment submitted. Awaiting approval.");
    } catch (err) {
      toast.error("Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-6">
      <div className="grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
        
        {/* LEFT — BILLING FORM */}
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Billing</h2>

          <p className="text-sm text-gray-600 mb-4">
            Pay via MPesa Send Money to:
            <br />
            <b>0794721461</b>
          </p>

          <div className="space-y-4">
            <input
              className={inputClasses}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className={inputClasses}
              placeholder="Mpesa Code (QWER1234)"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full py-2 rounded-4xl text-white font-semibold"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            {loading ? "Submitting..." : "Submit Payment"}
          </button>
        </div>

        {/* RIGHT — PLAN SUMMARY */}
        <div
          className="p-8 text-white flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(135deg, #ff5c00 0%, #ff8c42 100%)",
          }}
        >
          <div>
            <p className="opacity-80">Subscribing to</p>
            <h3 className="text-3xl font-bold">{selectedPlan.name}</h3>

            <p className="text-2xl mt-4">
              KES {selectedPlan.price}
              <span className="text-sm opacity-80"> / month</span>
            </p>

            <ul className="mt-6 space-y-2 text-sm opacity-95">
              {selectedPlan.features.map((f, i) => (
                <li key={i}>✓ {f}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs opacity-80 mt-6">
            After payment submission, your subscription will be activated
            once verified by Flowmerce.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Billing;
