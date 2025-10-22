import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Trash2,
  Ban,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import api from "../utils/api";

const statusColors = {
  Active: "bg-green-100 text-green-600",
  Inactive: "bg-gray-100 text-gray-500",
  Banned: "bg-red-100 text-red-600",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Helper function for better time formatting
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const diffMs = new Date() - new Date(dateString);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${diffYear}y ago`;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/");

        // Handle different response formats
        let usersData = [];

        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          // Handle paginated response (common in DRF)
          usersData = response.data.results;
        } else if (response.data && typeof response.data === "object") {
          // Handle single user or object response
          usersData = [response.data];
        } else {
          throw new Error("Unexpected API response format");
        }

        // Transform user data
        const userData = usersData.map((user) => ({
          id: user.id || user.pk,
          name: user.name || user.username || user.email.split("@")[0],
          email: user.email || "No email",
          date: user.date_joined
            ? new Date(user.date_joined).toLocaleDateString()
            : "Unknown",
          type: user.is_staff ? "Staff" : "Normal",
          status: user.is_active ? "Active" : "Inactive",
          lastActive: formatTimeAgo(user.last_login),
        }));

        setUsers(userData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch users"
        );
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Rest of your component remains the same...
  const getUserValue = (user, key) => {
    if (!user) return "";
    const value = user[key];
    return value !== undefined ? String(value) : "";
  };

  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = getUserValue(a, sortConfig.key);
      const bValue = getUserValue(b, sortConfig.key);

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortConfig]);

  const filteredUsers = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedUsers.filter(
      (user) =>
        getUserValue(user, "name").toLowerCase().includes(term) ||
        getUserValue(user, "email").toLowerCase().includes(term)
    );
  }, [sortedUsers, searchTerm]);

  const { currentUsers, totalPages } = React.useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    return { currentUsers, totalPages };
  }, [filteredUsers, currentPage, usersPerPage]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleBanUser = async (userId) => {
    try {
      await api.patch(`/users/${userId}/`, { is_active: false });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: "Inactive" } : user
        )
      );
    } catch (err) {
      setError("Failed to ban user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}/`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-[#F49CAC]/30 rounded-4xl focus:outline-none focus:ring-2 focus:ring-[#ff5c00]"
          />
        </div>
        <button className="bg-[#ff5c00] text-white px-4 py-2 rounded-4xl shadow">
          Users Applications
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100/30">
            <tr>
              {[
                "name",
                "email",
                "date",
                "type",
                "status",
                "lastActive",
                "actions",
              ].map((key) => (
                <th
                  key={key}
                  className="py-3 px-4 cursor-pointer"
                  onClick={() => key !== "actions" && requestSort(key)}
                >
                  <div className="flex items-center">
                    {
                      {
                        name: "Name",
                        email: "Email",
                        date: "Register Date",
                        type: "Account Type",
                        status: "Status",
                        lastActive: "Last Active",
                        actions: "Actions",
                      }[key]
                    }
                    {key !== "actions" &&
                      sortConfig.key === key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-800">{user.name}</div>
                  </td>
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4">{user.date}</td>
                  <td className="py-4 px-4">{user.type}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[user.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">{user.lastActive}</td>
                  <td className="py-4 px-4 flex gap-3">
                    <Trash2
                      className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-800"
                      onClick={() => handleDeleteUser(user.id)}
                    />
                    <Ban
                      className="w-4 h-4 text-[#ff5c00] cursor-pointer hover:text-[#e04b00]"
                      onClick={() => handleBanUser(user.id)}
                    />
                    <MoreVertical className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-800" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  {users.length === 0
                    ? "No users found"
                    : "No matching users found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-4 py-2 rounded-md ${
                currentPage === i + 1
                  ? "bg-[#ff5c00] text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
