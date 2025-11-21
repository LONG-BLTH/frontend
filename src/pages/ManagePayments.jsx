import { useState, useEffect } from 'react';
import { paymentsAPI, ordersAPI } from '../services/api';
import Swal from 'sweetalert2';

function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let response;

      if (filterStatus) {
        response = await paymentsAPI.getByStatus(filterStatus);
      } else {
        response = await paymentsAPI.getAll();
      }

      setPayments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch payments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentId) => {
    const result = await Swal.fire({
      title: 'Process Payment?',
      text: 'This will mark the payment as completed and generate a transaction ID',
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
      fetchPayments(); // Refresh list
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to process payment',
      });
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-800',
      Refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Payments</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <label className="block text-gray-700 font-medium mb-2">Filter by Status</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Payments</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No payments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Transaction ID</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{payment.customerName}</td>
                    <td className="py-3 px-4">{payment.customerEmail}</td>
                    <td className="py-3 px-4 font-bold">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">{payment.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {payment.transactionId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
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
      )}
    </div>
  );
}

export default ManagePayments;
