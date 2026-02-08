import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Profile = () => {
  // Temporary hard‑coded values until backend fields exist
  const user = {
    name: "Jimmy Developer",
    email: "jimmy@example.com",
    businessName: "Jimmy Tech Store",
    role: "Owner",
    country: "Tanzania",
    subscription: "Pro Plan",
  };

  return (
    <div className="p-6  min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <Card className="rounded-2xl shadow-md mb-6">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-[#ff5c00] text-white flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0)}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="rounded-2xl shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              <Button className="bg-[#ff5c00] hover:bg-[#e14f00]">
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Business Name" value={user.businessName} />
              <InfoItem label="Role" value={user.role} />
              <InfoItem label="Country" value={user.country} />
              <InfoItem label="Subscription Plan" value={user.subscription} />
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <Button className="bg-[#ff5c00] hover:bg-[#e14f00]">
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Full Name" value={user.name} />
              <InfoItem label="Email" value={user.email} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4 border">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default Profile;
