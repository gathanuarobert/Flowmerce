import React from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    code: "basic",
    name: "Basic",
    price: "KES 1500 / month",
    features: [
      "500 products inventory handling",
      "Order Tracking",
      "One business",
      "1 Staff User handling",
    ],
  },
  {
    code: "pro",
    name: "Pro",
    price: "KES 2000 / month",
    highlight: true,
    features: [
      "1 business",
      "2–3 staff user handling",
      "1000 products inventory handling",
      "AI advisor (Limited Queries)",
      "24/7 Customer Support",
    ],
  },
  {
    code: "premium",
    name: "Premium",
    price: "KES 3500 / month",
    features: [
      "Unlimited products inventory",
      "1 business unlimited multi-user staff",
      "AI advisor (Unlimited)",
      "Priority customer support",
    ],
  },
];

export default function PlansPage() {
  const navigate = useNavigate();

  const handleSubscribe = (planCode) => {
    navigate("/billing", { state: { plan: planCode } });
  };

  return (
    <div className="min-h-screen  p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Choose your plan</h1>
        <p className="text-gray-600 mt-2">
          Simple pricing for businesses using Flowmerce
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className={`rounded-2xl p-6 shadow-md transition transform hover:scale-[1.02]
            ${plan.highlight ? "bg-white  shadow-lg" : "bg-white"}`}
          >
            {/* Plan name */}
            <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>

            {/* Price */}
            <p className="text-3xl font-bold text-[#ff5c00] mt-3">
              {plan.price}
            </p>

            {/* Features */}
            <ul className="mt-6 space-y-2 text-gray-600">
              {plan.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>

            {/* Button */}
            <button
              onClick={() => handleSubscribe(plan.code)}
              className="mt-6 w-full bg-[#ff5c00] text-white py-2 rounded-xl hover:bg-[#e65500] transition"
            >
              Purchase Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
