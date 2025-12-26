import React from "react";
import { TbUsers } from "react-icons/tb";

const Users = () => {
  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <TbUsers className="text-3xl text-[#ff5c00]" />
        <h1 className="text-2xl font-semibold">Users</h1>
      </div>

      <div className="mt-6 p-6 border border-dashed rounded-xl bg-gray-50">
        <p className="text-lg font-medium text-gray-700 mb-2">
          Enterprise Feature
        </p>

        <p className="text-gray-500 max-w-xl">
          Detailed employee-level management is intended for large businesses
          such as supermarkets and chain stores.
        </p>

        <p className="text-gray-500 mt-2 max-w-xl">
          Flowmerce currently focuses on MMEs and SMEs, where this feature is
          usually unnecessary.
        </p>

        <p className="text-sm text-gray-400 mt-4">
          This feature may be introduced in future enterprise plans.
        </p>
      </div>
    </div>
  );
};

export default Users;
