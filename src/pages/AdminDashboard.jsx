import { useState, useEffect } from 'react';
import { analyticsAPI, ordersAPI, paymentsAPI } from '../services/api';
import Swal from 'sweetalert2';

function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    productStats: null,
    orderStats: null,
    paymentStats: null,
  });
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        productStatsRes,
        orderStatsRes,
        paymentStatsRes,
        ordersRes,
        paymentsRes,
      ] = await Promise.all([
        analyticsAPI.getProductStats(),
        analyticsAPI.getOrderStats(),
        analyticsAPI.getPaymentSuccessRate(),
        ordersAPI.getAll(),
        paymentsAPI.getAll(),
      ]);

      // Handle different response structures
      const paymentData = paymentStatsRes.data || {};

      setAnalytics({
        productStats: { totalProducts: productStatsRes.data || 0 },
        orderStats: orderStatsRes.data || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
        paymentStats: {
          ...paymentData,
          // Remove % sign from successRate if it exists
          successRate: typeof paymentData.successRate === 'string'
            ? parseFloat(paymentData.successRate)
            : paymentData.successRate || 0
        },
      });

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Order status updated successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchData(); // Refresh data
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update order status',
      });
      console.error(err);
    }
  };

  const handleProcessPayment = async (paymentId) => {
    const result = await Swal.fire({
      title: 'Process Payment?',
      text: 'This will mark the payment as completed',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, process it!',
    });

    if (!result.isConfirmed) return;

    try {
      await paymentsAPI.process(paymentId);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Payment processed successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchData(); // Refresh data
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to process payment',
      });
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Products Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Products</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {(analytics.productStats?.totalProducts || 0).toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>

              {/* Orders Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Orders</h3>
                <p className="text-3xl font-bold text-green-600">
                  {(analytics.orderStats?.totalOrders || 0).toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">
                  Revenue: ${(analytics.orderStats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* Payments Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Payments</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {typeof analytics.paymentStats?.successRate === 'number'
                    ? analytics.paymentStats.successRate.toFixed(1)
                    : 0}%
                </p>
                <p className="text-gray-600 text-sm">
                  {(analytics.paymentStats?.totalPayments || 0).toLocaleString()} Total Payments
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order #</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{order.orderNumber}</td>
                        <td className="py-3 px-4">{order.customerName}</td>
                        <td className="py-3 px-4">${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order._id, e.target.value)
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Payments</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{payment.customerName}</td>
                        <td className="py-3 px-4">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4">{payment.paymentMethod}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              payment.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {payment.status === 'Pending' && (
                            <button
                              onClick={() => handleProcessPayment(payment._id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Process
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </div>
  );
}

export default AdminDashboard;
