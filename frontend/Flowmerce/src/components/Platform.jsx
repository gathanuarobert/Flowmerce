import React from "react";
import { CiGlobe } from "react-icons/ci";
import { FaApple, FaTabletAlt } from "react-icons/fa";
import { DiAndroid } from "react-icons/di";

const Platform = () => {
  return (
    <div className="p-5 bg-white rounded-lg">
      <h1 className="text-2xl font-bold text-gray-700">Platform</h1>
      <div className="p-2 grid grid-cols-2 gap-8">
        <div className="space-y-2 text-gray-500"> 
          <h1 className="text-2xl font-bold">58</h1>
          <p className="flex items-center space-x-2">
            <CiGlobe /> <span>website</span>
          </p>
        </div>
        <div className="space-y-2 text-gray-500">
          <h1 className="text-2xl font-bold">87</h1>
          <p>
            <FaApple /> <span>IOS</span>
          </p>
        </div>
        <div className="space-y-2 text-gray-500">
          <h1 className="text-2xl font-bold">58</h1>
          <p className="flex items-center space-x-2">
            <DiAndroid /> <span>Android</span>
          </p>
        </div>
        <div className="space-y-2 text-gray-500">
          <h1 className="text-2xl font-bold">58</h1>
          <p>
            <FaTabletAlt /> <span>Tablets</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Platform;
