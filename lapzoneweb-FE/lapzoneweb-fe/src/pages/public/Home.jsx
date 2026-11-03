import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api'; 
// Đã sửa lại đường dẫn import Header, Footer cho đúng thư mục
import Header from '../../components/layouts/Header'; 
import Footer from '../../components/layouts/Footer'; 

export default function Home() {
  const [laptopProducts, setLaptopProducts] = useState([]);
  const [appleProducts, setAppleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Tích hợp đúng API /home 
        const response = await api.get('/home');
        
        // Map dữ liệu từ Backend
        setLaptopProducts(response.data.laptopProducts || response.data.hotLaptops || []);
        setAppleProducts(response.data.appleProducts || response.data.appleMacbooks || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderProductCard = (product, isApple = false) => (
    <article key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden relative group flex flex-col">
      
      {product.stock === 0 ? (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow">Hết Hàng</div>
      ) : isApple ? (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow"><i className="fab fa-apple mr-1"></i> Mac</div>
      ) : (
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow">HOT!</div>
      )}
      
      <Link to={`/product_detail/${product.id}`} className="flex-1 flex flex-col p-5">
        <div className="h-48 flex items-center justify-center mb-4 overflow-hidden relative">
          <img 
            loading="lazy" 
            src={product.image?.startsWith('assets/') ? `/${product.image}` : `/assets/${product.image}`} 
            alt={product.name}
            className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.src = '/assets/logo-lapzone.jpg'; }} // Thêm bắt lỗi ảnh
          />
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">Xem chi tiết</span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
        
        <div className="mt-auto">
          <div className="text-xl font-bold text-red-600 mb-3">{formatPrice(product.price)}</div>
          
          {product.productDetail && (
            <div className="bg-gray-50 rounded-lg p-2 mb-3 text-xs text-gray-600 space-y-1 border border-gray-100">
              <div className="truncate"><span className="font-semibold">CPU:</span> {product.productDetail.cpu}</div>
              <div className="truncate"><span className="font-semibold">RAM:</span> {product.productDetail.ram}</div>
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-3">
            <span className="font-medium bg-gray-100 px-2 py-1 rounded">Kho: {product.stock}</span>
            <button className="hover:text-red-500 transition-colors" onClick={(e) => { e.preventDefault(); alert('Đã thích!'); }}><i className="far fa-heart text-lg"></i></button>
          </div>
        </div>
      </Link>
    </article>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden relative shadow-lg h-96 group">
              <img 
                loading="lazy" 
                src="/assets/reviewimage.webp" 
                alt="Banner" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-10 flex flex-col justify-end">
                <h2 className="text-white text-4xl md:text-5xl font-bold mb-3 tracking-wide">Thế Hệ Laptop Mới</h2>
                <p className="text-gray-200 text-lg">Trang bị card đồ họa RTX 40 Series mạnh mẽ</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 h-96">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                <h3 className="text-blue-600 font-bold text-lg mb-4 flex items-center">
                  <i className="fas fa-newspaper mr-2"></i> Tin Công Nghệ
                </h3>
                <ul className="flex flex-col gap-3 text-sm text-gray-600 font-medium">
                  <li><a href="#" className="hover:text-blue-600 transition-colors">&bull; Tạm Ngưng Hỗ Trợ Kĩ Thuật, Bảo Dưỡng</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">&bull; Đặt Lịch Hẹn Trước Để Được Hỗ Trợ</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition-colors">&bull; Thông Báo Lịch Làm Việc Dịp Lễ</a></li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 rounded-2xl text-white flex flex-col justify-center items-center text-center flex-1 shadow-md">
                <h3 className="text-2xl font-bold mb-2">Ưu Đãi Lớn</h3>
                <p className="mb-4 font-medium opacity-90">Giảm tới 20% cho sinh viên</p>
                <a href="#" className="bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-sm">
                  Xem Ngay
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 mb-6">Laptop theo nhu cầu</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <Link to="/search?query=Văn Phòng" className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group">
              <img src="/assets/vanphonghoctap.webp" alt="Văn phòng" className="h-24 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-gray-800">Học Tập, Văn Phòng</h4>
            </Link>
            <Link to="/search?query=Đồ Họa" className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group">
              <img src="/assets/dohoakythuat.webp" alt="Đồ họa" className="h-24 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-gray-800">Đồ Họa, Kỹ Thuật</h4>
            </Link>
            <Link to="/search?query=Lập Trình" className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group">
              <img src="/assets/laptoplaptrinh.webp" alt="Lập trình" className="h-24 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-gray-800">Lập Trình</h4>
            </Link>
            <Link to="/search?query=Gaming" className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group">
              <img src="/assets/gamelaptop.webp" alt="Gaming" className="h-24 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-gray-800">Gaming</h4>
            </Link>
            <Link to="/search?minPrice=30000000" className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 group">
              <img src="/assets/sieuphamlaptop.webp" alt="Siêu Phẩm" className="h-24 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-gray-800">Cao Cấp (Premium)</h4>
            </Link>
          </div>
        </section>

        {/* HOT PRODUCTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex justify-between items-center mb-6 border-b-2 border-blue-600 pb-2">
            <h2 className="text-2xl font-bold text-gray-900">Máy Tính Xách Tay HOT</h2>
            <Link to="/search?query=Laptop" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center">
              Xem tất cả <i className="fas fa-arrow-right ml-2 text-sm"></i>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {laptopProducts.map(product => renderProductCard(product))}
            </div>
          )}
        </section>

        {/* APPLE MACBOOK */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex justify-between items-center mb-6 border-b-2 border-gray-800 pb-2">
            <h2 className="text-2xl font-bold text-gray-900"><i className="fab fa-apple mr-2"></i>Apple MacBook</h2>
            <Link to="/search?query=Macbook" className="text-gray-600 font-semibold hover:text-gray-900 transition-colors flex items-center">
              Xem tất cả <i className="fas fa-arrow-right ml-2 text-sm"></i>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-800 border-t-transparent"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {appleProducts.map(product => renderProductCard(product, true))}
            </div>
          )}
        </section>

        {/* FEATURES / PROMISES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-white border border-blue-100 rounded-3xl p-12 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 translate-y-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Bạn Xứng Đáng Với Những Điều Tốt Nhất</h2>
              <p className="text-gray-500 font-medium mb-12 text-lg">Cam kết của Lapzone đối với mọi khách hàng</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm"><i className="fa-solid fa-award"></i></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Chất Lượng & Giá Tốt Nhất</h3>
                  <p className="text-gray-600 leading-relaxed">Sản phẩm laptop nhập khẩu cao cấp với chất lượng dịch vụ không ngừng nâng cao.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm"><i className="fa-solid fa-handshake"></i></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Bảo Dưỡng Trọn Đời</h3>
                  <p className="text-gray-600 leading-relaxed">Miễn phí vệ sinh – bôi keo tản nhiệt – kiểm tra định kỳ trọn đời sử dụng.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm"><i className="fa-solid fa-truck-fast"></i></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Giao Hàng Nhanh</h3>
                  <p className="text-gray-600 leading-relaxed">Giao nhanh toàn quốc, đóng gói chống sốc đảm bảo an toàn tuyệt đối.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}