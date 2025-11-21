import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import ManagePayments from './pages/ManagePayments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/products" />} />
                <Route path="/products" element={<Products />} />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-order"
                  element={
                    <ProtectedRoute>
                      <CreateOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute requireAdmin>
                      <ManageProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <ProtectedRoute requireAdmin>
                      <ManagePayments />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
