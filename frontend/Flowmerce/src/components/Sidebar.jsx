import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuBox } from "react-icons/lu";
import { TbBrandGoogleAnalytics, TbReportSearch, TbUsers } from "react-icons/tb";
import { MdInventory, MdShoppingCart } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(null);

  const SIDEBAR_LINKS = [
    { id: 1, path: "/", name: "Dashboard", icon: LuBox },
    { id: 2, path: "/users", name: "Users", icon: TbUsers },
    { id: 3, path: "/products", name: "Products", icon: MdInventory },
    { id: 5, path: "/orders", name: "Orders", icon: MdShoppingCart },
    { id: 4, path: "/analytics", name: "Analytics", icon: TbBrandGoogleAnalytics },
    { id: 6, path: "/reports", name: "Reports", icon: TbReportSearch },
  ];

  // 🧠 Update active link whenever the URL changes
  useEffect(() => {
    const current = SIDEBAR_LINKS.findIndex(
      (link) => link.path === location.pathname
    );
    setActiveLink(current);
  }, [location.pathname]);

  return (
    <div className="w-16 md:w-56 fixed left-0 top-0 z-10 h-screen pt-8 px-4 bg-white">
      <div className="">
        <img src="/logo.jpg" alt="logo" className="w-10 hidden md:flex" />
        <img src="/logo_mini.jpg" alt="logo" className="w-8 flex md:hidden" />
      </div>

      <ul className="mt-2 space-y-4">
        {SIDEBAR_LINKS.map((link, index) => {
          const isActive = activeLink === index;
          const Icon = link.icon;
          return (
            <li
              key={index}
              className={`font-medium rounded-4xl py-2 px-5 hover:bg-gray-100 hover:text-amber-700 transition ${
                isActive ? "bg-[#ff5c00] text-white" : ""
              }`}
            >
              <Link
                to={link.path}
                className="flex justify-center md:justify-start items-center md:space-x-5"
                onClick={() => setActiveLink(index)}
              >
                <Icon />
                <span
                  className={`text-sm hidden md:flex ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="w-full absolute bottom-5 left-0 px-4 py-2 cursor-pointer text-center">
        <p className="flex items-center space-x-2 text-sm text-white py-2 px-5 bg-gradient-to-r from-amber-500 to-[#ff5c00] rounded-full">
          <span>?</span> <span className="hidden md:flex">Need Help</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
