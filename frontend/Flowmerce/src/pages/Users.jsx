import React, { useState } from 'react';
import { Search, MoreVertical, Trash2, Ban } from 'lucide-react';

const users = [
  { id: 1, name: 'Joshua Anderson', email: 'joshua109@gmail.com', date: '07/09/2023', type: 'Normal', followers: 605, lastActive: '12 min ago', status: 'Active' },
  { id: 2, name: 'James Robert', email: 'james109@gmail.com', date: '05/09/2023', type: 'Normal', followers: 120, lastActive: '30 min ago', status: 'Active' },
  { id: 3, name: 'Ryan Parker', email: 'ryan109@gmail.com', date: '03/09/2023', type: 'Normal', followers: 900, lastActive: '1 hr ago', status: 'Active' },
  { id: 4, name: 'Ava Martin', email: 'ava109@gmail.com', date: '03/09/2023', type: 'Normal', followers: 103, lastActive: '2 hr ago', status: 'Active' },
  { id: 5, name: 'Lily Walker', email: 'lily109@gmail.com', date: '02/09/2023', type: 'Normal', followers: 301, lastActive: '32 min ago', status: 'Inactive' },
  { id: 6, name: 'Caleb Davis', email: 'caleb109@gmail.com', date: '01/09/2023', type: 'Normal', followers: 875, lastActive: '1 hr ago', status: 'Active' },
  { id: 7, name: 'Ethan Turner', email: 'ethan109@gmail.com', date: '25/08/2023', type: 'Normal', followers: 497, lastActive: '3 hr ago', status: 'Active' },
];

const Users = () => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-xl">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-[#f49cac]/30 rounded-md w-1/3 focus:outline-0 focus:ring-2 focus:ring-[#ff5c00]"
        />
        <button className="bg-[#ff5c00] text-white px-4 py-2 rounded-md shadow">Users Applications</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100/30">
            <tr>
              <th className="py-2">Name</th>
              <th>Register Date</th>
              <th>Account Type</th>
              <th>Served</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3">
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td>{user.date}</td>
                <td>{user.type}</td>
                <td>{user.followers}</td>
                <td>{user.lastActive}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="flex gap-2 items-center">
                  <Trash2 className="w-4 h-4 text-red-600 cursor-pointer" />
                  <Ban className="w-4 h-4 text-[#ff5c00] cursor-pointer" />
                  <MoreVertical className="w-4 h-4 text-gray-600 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
