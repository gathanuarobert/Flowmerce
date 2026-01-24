import React, { useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const PRIMARY_COLOR = "#ff5c00";

const inputClasses =
  "bg-[#F49CAC]/30 px-4 py-2 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-600 w-full";

function Billing() {
  const [mpesaCode, setMpesaCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mpesaCode) {
      toast.error("Enter Mpesa transaction code");
      return;
    }

    setLoading(true);
    try {
      await api.post("/subscriptions/", {
        amount: 1000,
        mpesa_code: mpesaCode,
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
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Billing</h2>

      <p className="text-sm text-gray-600 mb-4">
        Pay via Mpesa to <b>07XXXXXXXX</b> then enter the transaction code below.
      </p>

      <input
        className={inputClasses}
        placeholder="Mpesa Code (e.g. QWE123ABC)"
        value={mpesaCode}
        onChange={(e) => setMpesaCode(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 w-full py-2 rounded-4xl text-white font-semibold"
        style={{ backgroundColor: PRIMARY_COLOR }}
      >
        {loading ? "Submitting..." : "Submit Payment"}
      </button>
    </div>
  );
}

export default Billing;
