import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import Swal from 'sweetalert2';

function CreateOrder() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    }
  };

  const handleAddItem = (product) => {
    const existing = selectedItems.find((item) => item.product._id === product._id);

    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { product, quantity: 1, price: product.price },
      ]);
    }
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(selectedItems.filter((item) => item.product._id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setSelectedItems(
      selectedItems.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Please add at least one item to the order',
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const orderData = {
        customerName: user.name,
        customerEmail: user.email,
        items: selectedItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
      };

      await ordersAPI.create(orderData);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Order created successfully',
        timer: 2000,
        showConfirmButton: false,
      });
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to create order',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Order</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Products */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Available Products
            </h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                    <p className="text-blue-600 font-bold mt-1">${product.price.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">Stock: {product.stock.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleAddItem(product)}
                    disabled={product.stock === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              {selectedItems.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No items added yet
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {selectedItems.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex justify-between items-center border-b pb-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">
                            {item.product.name}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            ${item.price.toLocaleString()} × {item.quantity.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.product._id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                    >
                      {loading ? 'Creating Order...' : 'Place Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

export default CreateOrder;
