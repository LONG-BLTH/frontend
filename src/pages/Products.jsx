import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};

      if (category) params.category = category;
      if (sortBy) {
        params.sort = sortBy;
        params.order = 'asc';
      }

      const response = await productsAPI.getAll(params);
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const response = await productsAPI.search(searchQuery);
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Products</h2>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    fetchProducts();
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 text-lg">No products found</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Stock: {product.stock.toLocaleString()} units
                  </p>
                </div>
              ))
            )}
          </div>
        )}
    </div>
  );
}

export default Products;
