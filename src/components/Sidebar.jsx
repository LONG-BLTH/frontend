import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

function Sidebar() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path) => {
    return location.pathname === path
      ? 'bg-blue-700 text-white'
      : 'text-gray-300 hover:bg-blue-700 hover:text-white';
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      logout();
      Swal.fire({
        icon: 'success',
        title: 'Logged out',
        text: 'You have been logged out successfully',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">ShopEase</h1>
          {user && (
            <p className="text-sm text-blue-200 mt-2">
              Welcome, {user.name}
              {isAdmin && <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">Admin</span>}
            </p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/products"
            className={`block px-4 py-3 rounded-lg transition ${isActive('/products')}`}
          >
            📦 Products
          </Link>

          {user && (
            <>
              <Link
                to="/orders"
                className={`block px-4 py-3 rounded-lg transition ${isActive('/orders')}`}
              >
                📋 My Orders
              </Link>
              <Link
                to="/create-order"
                className={`block px-4 py-3 rounded-lg transition ${isActive('/create-order')}`}
              >
                🛒 Create Order
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="border-t border-blue-700 my-4"></div>
              <p className="text-xs text-blue-300 px-4 mb-2 uppercase tracking-wide">Admin Panel</p>
              <Link
                to="/admin"
                className={`block px-4 py-3 rounded-lg transition ${isActive('/admin')}`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/admin/products"
                className={`block px-4 py-3 rounded-lg transition ${isActive('/admin/products')}`}
              >
                ⚙️ Manage Products
              </Link>
              <Link
                to="/admin/payments"
                className={`block px-4 py-3 rounded-lg transition ${isActive('/admin/payments')}`}
              >
                💳 Manage Payments
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-700">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition"
            >
              🚪 Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="block text-center bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition"
            >
              🔐 Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
