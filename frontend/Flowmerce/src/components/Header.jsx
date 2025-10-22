import React, { useEffect, useState } from "react";
import { GoBell } from "react-icons/go";
import api from "../utils/api";

const Header = () => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me/"); // 👈 Adjust endpoint if different
        const user = response.data;

        if (user && user.email) {
          // Convert email into readable name
          const rawName = user.email.split("@")[0];
          const formattedName = rawName
            .replace(/[._]/g, " ")
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
          setUserName(formattedName);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex justify-between items-center p-4 w-full">
      <div>
        <h1 className="text-xs text-gray-500">Welcome Back to Flowmerce</h1>
        <p className="text-xl font-semibold text-gray-800">{userName}</p>
      </div>

      <div className="flex items-center space-x-5">
        <div>
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#F49CAC]/30 px-4 py-2 rounded-4xl focus:outline-0 focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <div className="flex items-center space-x-5">
          <button className="relative text-2xl text-gray-600">
            <GoBell size={28} />
            <span
              className="absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center bg-[#FF5C00] text-white 
              font-semibold text-[10px] w-5 h-4 rounded-full border-2 border-white"
            >
              9
            </span>
          </button>
          <img
            className="w-8 h-8 rounded-full border-2 bg-[#ff5c00] border-amber-500"
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${userName}`}
            alt="user avatar"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
