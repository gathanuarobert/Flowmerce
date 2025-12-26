import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuBox } from "react-icons/lu";
import {
  TbBrandGoogleAnalytics,
  TbReportSearch,
  TbDatabase,
  TbRobot,
} from "react-icons/tb";
import { MdInventory, MdShoppingCart } from "react-icons/md";
import { FiCpu } from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(null);

  const SIDEBAR_LINKS = [
    { id: 1, path: "/", name: "Dashboard", icon: LuBox },

    { id: 3, path: "/products", name: "Products", icon: MdInventory },
    { id: 5, path: "/orders", name: "Orders", icon: MdShoppingCart },
    {
      id: 4,
      path: "/analytics",
      name: "Analytics",
      icon: TbBrandGoogleAnalytics,
    },
    { id: 6, path: "/reports", name: "AI Assistant", icon: FiCpu },
  ];

  // 🧠 Update active link whenever the URL changes
  useEffect(() => {
    const current = SIDEBAR_LINKS.findIndex(
      (link) => link.path === location.pathname
    );
    setActiveLink(current);
  }, [location.pathname]);

  return (
    <div className="w-16 md:w-56 fixed left-0 top-0 z-10 h-screen pt-8 px-4 bg-white flex flex-col justify-between shadow-sm">
      {/* Logo Section */}
      <Link
        to="/"
        className="flex justify-center md:justify-start items-center mb-8 group"
      >
        <TbDatabase className="text-2xl text-[#ff5c00] group-hover:opacity-80 transition" />
        <span className="hidden md:flex ml-2 font-semibold text-[#ff5c00] text-lg group-hover:opacity-80 transition">
          Flowmerce
        </span>
      </Link>

      {/* Navigation Links */}
      <ul className="flex-1 space-y-4">
        {SIDEBAR_LINKS.map((link, index) => {
          const isActive = activeLink === index;
          const Icon = link.icon;
          return (
            <li
              key={index}
              className={`font-medium rounded-3xl py-2 px-2 md:px-5 hover:bg-gray-100 hover:text-amber-700 transition ${
                isActive ? "bg-[#ff5c00] text-white" : ""
              }`}
            >
              <Link
                to={link.path}
                className="flex flex-col md:flex-row justify-center md:justify-start items-center md:space-x-5"
                onClick={() => setActiveLink(index)}
              >
                {/* Icon — always visible */}
                <Icon className="text-xl mb-1 md:mb-0" />

                {/* Label — hidden on small screens */}
                <span
                  className={`text-sm hidden md:flex ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Help Section */}
      <div className="w-full mt-auto px-2 md:px-4 py-2">
        <Link
          to="/reports"
          className="flex flex-col md:flex-row items-center justify-center md:justify-start md:space-x-3 py-2 px-2 md:px-5 
               bg-gradient-to-r from-amber-500 to-[#ff5c00] text-white rounded-4xl font-medium hover:opacity-90 transition"
        >
          <span className="text-lg font-bold">?</span>
          <span className="hidden md:flex text-sm">Need Help?</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
