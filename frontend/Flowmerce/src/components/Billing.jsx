import { useState } from "react";

export default function Billing() {
  const [mpesaCode, setMpesaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitPayment = async () => {
    if (!mpesaCode) {
      alert("Please enter M-Pesa transaction code");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/payments/request/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_code: "basic",   // or selected by user
        amount: 1500,
        currency: "KES",
        mpesa_reference: mpesaCode,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      alert(data.detail || "Something went wrong");
    }
  };

  if (submitted) {
    return (
      <div className="billing-box">
        <h2>Payment Submitted ✅</h2>
        <p>
          Your payment is pending verification.  
          You will gain access once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="billing-box">
      <h2>Subscription Required</h2>

      <p>
        Your subscription has expired or is inactive.
        Please renew to continue using the app.
      </p>

      <hr />

      <h3>How to Pay</h3>
      <ol>
        <li>Open M-Pesa</li>
        <li>Send <strong>KES 1,500</strong> to: <strong>07XXXXXXXX</strong></li>
        <li>Enter the transaction code below</li>
      </ol>

      <input
        type="text"
        placeholder="M-Pesa Transaction Code"
        value={mpesaCode}
        onChange={(e) => setMpesaCode(e.target.value)}
      />

      <button onClick={submitPayment} disabled={loading}>
        {loading ? "Submitting..." : "Submit Payment"}
      </button>
    </div>
  );
}
