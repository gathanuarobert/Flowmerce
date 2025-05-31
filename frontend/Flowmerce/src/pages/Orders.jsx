import React from 'react';

const orders = [
  {
    id: "#123-132",
    customer: "Penelope Cruz",
    orderDate: "12 Aug 2023",
    payment: "Paid",
    status: "Shipped",
    amount: "$220.5",
  },
  {
    id: "#432-213",
    customer: "Mike More",
    orderDate: "11 Aug 2023",
    payment: "Paid",
    status: "Shipped",
    amount: "$350.4",
  },
  {
    id: "#124-556",
    customer: "Carmen Lupino",
    orderDate: "11 Aug 2023",
    payment: "Paid",
    status: "Shipped",
    amount: "$30.2",
  },
  {
    id: "#476-653",
    customer: "Neil Ietminas",
    orderDate: "10 Aug 2023",
    payment: "Paid",
    status: "Shipped",
    amount: "$44.5",
  },
  {
    id: "#654-426",
    customer: "Christie Ricci",
    orderDate: "9 Aug 2023",
    payment: "Paid",
    status: "Shipped",
    amount: "$220.2",
  },
];

const Orders = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-lg font-semibold mb-4">Recent Orders</h1>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100/30 text-gray-600">
            <th className="py-2">ORDER NUMBER</th>
            <th>CUSTOMER</th>
            <th>ORDER DATE</th>
            <th>PAYMENT</th>
            <th>STATUS</th>
            <th>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={idx} className="hover:bg-gray-50 text-sm text-gray-700">
              <td className="py-3">{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.orderDate}</td>
              <td>
                <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">
                  {order.payment}
                </span>
              </td>
              <td>
                <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full">
                  {order.status}
                </span>
              </td>
              <td>{order.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
