import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// 2. Pages - Public
import Home from './pages/public/Home';
import ProductDetail from './pages/public/ProductDetail';
import Profile from './pages/public/Profile';
import Search from './pages/public/Search';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import CheckoutSuccess from './pages/public/CheckoutSuccess';
import OrderDetail from './pages/public/OrderDetail';
import OrderLookup from './pages/public/OrderLookup';

// 3. Pages - Admin
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminPrintReport from './pages/admin/AdminPrintReport';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

export default function App() {
  return (
    // BẮT BUỘC PHẢI CÓ THẺ <Router> BỌC NGOÀI CÙNG NÀY
    <Router>
      <div className="App font-sans text-gray-900 bg-gray-50 min-h-screen">
        <Routes>
          {/* ================= ROUTE KHÁCH HÀNG ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/product_detail/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/tracuudonhang" element={<OrderLookup />} />

          {/* ================= ROUTE XÁC THỰC ================= */}
          <Route path="/dangnhap" element={<Login />} />
          <Route path="/dangki" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ================= ROUTE QUẢN TRỊ (ADMIN) ================= */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/invoices" element={<AdminInvoices />} />
          <Route path="/admin/invoices/print" element={<AdminPrintReport />} />

          {/* ================= BẮT LỖI 404 ================= */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-500">
              404 | Không tìm thấy trang
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}