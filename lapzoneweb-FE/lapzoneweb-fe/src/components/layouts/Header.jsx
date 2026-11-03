import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  
  // States quản lý trạng thái bật/tắt menu
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showSub1, setShowSub1] = useState(false);
  const [showSub2, setShowSub2] = useState(false);
  
  // State quản lý Menu User (Chuyển sang Click)
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Đọc trạng thái đăng nhập từ localStorage
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      fetchCartCount();
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories'); 
        setCategories(res.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục sản phẩm:", error);
      }
    };
    
    fetchCategories();
  }, []);

  const fetchCartCount = async () => {
      try {
          const res = await api.get('/cart/count');
          setCartCount(res.data.count || 0);
      } catch (error) {
          console.error("Lỗi khi tải số lượng giỏ hàng:", error);
      }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      alert('Mời bạn nhập tên sản phẩm cần tìm!');
      return;
    }
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    sessionStorage.clear(); 
    setIsLoggedIn(false);
    setUserRole(null);
    setCartCount(0);
    setShowProfileMenu(false); // Đóng menu khi đăng xuất
    navigate('/dangnhap');
  };

  return (
    <header className="bg-gray-50 sticky top-0 z-50">
      {/* ================= TOP BAR (Trắng, Sạch sẽ) ================= */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105">
              <img className="h-12 w-auto" src="/assets/logo-lapzone.jpg" alt="Lapzone Logo" loading="lazy" />
            </Link>
            
            <div className="flex-1 max-w-2xl mx-12">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm laptop gaming, văn phòng..."
                  className="w-full pl-5 pr-12 py-2.5 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all shadow-inner"
                />
                <button type="submit" className="absolute right-1 top-1 bottom-1 px-5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            <div className="flex items-center space-x-6 text-gray-700">
              {!isLoggedIn ? (
                // --- KHI CHƯA ĐĂNG NHẬP ---
                <div className="flex items-center space-x-3">
                  <Link to="/dangnhap" className="px-5 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors border border-blue-100">
                    Đăng nhập
                  </Link>
                  <Link to="/dangki" className="px-5 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 shadow-md transition-transform hover:-translate-y-0.5">
                    <i className="fas fa-user-plus mr-1.5"></i> Đăng ký
                  </Link>
                </div>
              ) : (
                // --- KHI ĐÃ ĐĂNG NHẬP ---
                <div className="flex items-center space-x-5 text-xl">
                  {(userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') && (
                    <Link to="/admin/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors" title="Trang quản trị">
                      <i className="fas fa-user-shield text-lg"></i>
                    </Link>
                  )}
                  
                  <Link to="/tracuudonhang" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors" title="Tra cứu đơn hàng">
                    <i className="fas fa-file-invoice text-lg"></i>
                  </Link>
                  
                  <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors" title="Giỏ hàng">
                    <i className="fas fa-shopping-cart text-lg"></i>
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </Link>
                  
                  {/* Menu User Profile thả xuống (Đã sửa thành onClick) */}
                  <div className="relative ml-2">
                      <button 
                        type="button"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center focus:outline-none"
                      >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white shadow-sm border-2 border-white hover:shadow-md transition-all">
                               <i className="fas fa-user text-sm"></i>
                          </div>
                      </button>
                      
                      {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50">
                            <Link 
                               to="/profile" 
                               onClick={() => setShowProfileMenu(false)}
                               className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                            >
                               <i className="fas fa-id-card w-5 text-center mr-2"></i> Hồ sơ của tôi
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                               onClick={handleLogout} 
                               className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium"
                            >
                               <i className="fas fa-sign-out-alt w-5 text-center mr-2"></i> Đăng xuất
                            </button>
                        </div>
                      )}
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR (Thanh Menu Bo tròn, Màu Nhạt, Tách rời) ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="bg-blue-500 text-white rounded-2xl shadow-md">
          <ul className="flex items-center space-x-2 px-4 text-sm font-medium h-14">
            
            {/* CỤM DANH MỤC CÓ HOVER LỒNG NHAU */}
            <li 
              className="relative h-full flex items-center"
              onMouseEnter={() => setShowMainMenu(true)}
              onMouseLeave={() => setShowMainMenu(false)}
            >
              <Link to="/" className="px-5 py-2 hover:bg-blue-400 rounded-xl flex items-center transition-colors">
                <i className="fas fa-bars mr-2.5"></i> DANH MỤC SẢN PHẨM <i className="fas fa-chevron-down ml-2 text-[10px]"></i>
              </Link>
              
              {showMainMenu && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white text-gray-700 shadow-2xl rounded-xl border border-gray-100 z-50 py-2">
                    
                    {/* Cấp 2: Máy tính xách tay */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowSub1(true)}
                      onMouseLeave={() => setShowSub1(false)}
                    >
                      <Link to="/search?query=Laptop" className="flex items-center justify-between px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        Máy Tính Xách Tay <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                      </Link>
                      
                      {showSub1 && (
                        <div className="absolute left-full top-0 w-56 bg-white shadow-2xl rounded-xl border border-gray-100 py-2 ml-1">
                          <div className="px-5 py-2 font-bold text-blue-600 text-xs uppercase tracking-wider bg-blue-50/50">Thương hiệu</div>
                          {categories.length > 0 ? (
                            categories.map(cat => (
                              <Link key={cat.id} to={`/search?categoryId=${cat.id}`} className="block px-5 py-2 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">
                                {cat.name}
                              </Link>
                            ))
                          ) : (
                            <div className="px-5 py-2 text-gray-400 text-xs italic">Đang tải...</div>
                          )}
                          <div className="px-5 py-2 font-bold text-blue-600 text-xs uppercase tracking-wider bg-blue-50/50 mt-2 border-t border-gray-100">Tình Trạng</div>
                          <Link to="/search?query=Mới" className="block px-5 py-2 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">Brand New 100%</Link>
                          <Link to="/search?query=Cũ" className="block px-5 py-2 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">Outlet/Refurbished</Link>
                        </div>
                      )}
                    </div>

                    {/* Cấp 2: Laptop Gaming */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowSub2(true)}
                      onMouseLeave={() => setShowSub2(false)}
                    >
                      <Link to="/search?query=Gaming" className="flex items-center justify-between px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors border-t border-gray-50">
                        Laptop Gaming <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                      </Link>
                      
                      {showSub2 && (
                        <div className="absolute left-full top-0 w-56 bg-white shadow-2xl rounded-xl border border-gray-100 py-2 ml-1">
                          <Link to="/search?query=Nitro" className="block px-5 py-2.5 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">Acer Nitro</Link>
                          <Link to="/search?query=Legion" className="block px-5 py-2.5 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">Lenovo Legion</Link>
                          <Link to="/search?query=ROG" className="block px-5 py-2.5 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">Asus ROG</Link>
                          <Link to="/search?query=Alienware" className="block px-5 py-2.5 hover:bg-gray-50 hover:text-blue-600 text-sm transition-colors">Dell Alienware</Link>
                        </div>
                      )}
                    </div>
                    
                    <Link to="/search?query=Lập Trình" className="block px-5 py-3 border-t border-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors">Laptop Lập Trình</Link>
                    <Link to="/search?query=Đồ Họa" className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors">Laptop Đồ Họa</Link>
                    <Link to="/search?query=Macbook" className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-600 transition-colors">Apple MacBook</Link>
                </div>
              )}
            </li>
            
            {/* Các menu khác */}
            <li className="h-full flex items-center">
              <Link to="/gioithieu" className="px-5 py-2 hover:bg-blue-400 rounded-xl transition-colors">Giới thiệu</Link>
            </li>
            <li className="h-full flex items-center">
              <Link to="/khuyenmai" className="px-5 py-2 hover:bg-blue-400 rounded-xl transition-colors">Khuyến mãi</Link>
            </li>
            <li className="h-full flex items-center">
              <Link to="/diachi" className="px-5 py-2 hover:bg-blue-400 rounded-xl transition-colors">Hệ thống Showroom</Link>
            </li>
            
            {/* Nút Đặt lịch vứt sang bên phải */}
            <li className="h-full flex items-center ml-auto pr-2">
              <Link to="/datlich" className="px-5 py-2 bg-yellow-400 text-blue-900 rounded-xl hover:bg-yellow-300 transition-colors shadow-sm font-bold flex items-center">
                <i className="far fa-calendar-alt mr-2"></i> Đặt lịch hẹn
              </Link>
            </li>
            
          </ul>
        </nav>
      </div>
    </header>
  );
}