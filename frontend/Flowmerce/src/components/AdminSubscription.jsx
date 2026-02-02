import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const PRIMARY_COLOR = "#ff5c00";

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get("/subscriptions/?status=pending");
      setSubscriptions(res.data);
    } catch (err) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const approveSubscription = async (id) => {
    setApprovingId(id);
    try {
      await api.post(`/subscriptions/${id}/approve/`);
      toast.success("Subscription approved");
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error("Approval failed");
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Pending Subscriptions
        </h1>

        {subscriptions.length === 0 ? (
          <p className="text-gray-500">No pending subscriptions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 border">User</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border">Duration</th>
                  <th className="p-3 border">Mpesa Code</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#F49CAC]/10 transition"
                  >
                    <td className="p-3 border">
                      {sub.user_email || "—"}
                    </td>
                    <td className="p-3 border font-semibold">
                      Ksh {sub.amount}
                    </td>
                    <td className="p-3 border">
                      {sub.duration_days} days
                    </td>
                    <td className="p-3 border">
                      {sub.mpesa_code}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        disabled={approvingId === sub.id}
                        onClick={() => approveSubscription(sub.id)}
                        className="px-4 py-2 rounded-4xl text-white text-sm font-semibold"
                        style={{
                          backgroundColor: PRIMARY_COLOR,
                          opacity: approvingId === sub.id ? 0.6 : 1,
                        }}
                      >
                        {approvingId === sub.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSubscriptions;
