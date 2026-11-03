import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- LOGIC MỚI 1: KHUYẾN MÃI ĐẾM NGƯỢC ---
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const targetDate = "2026-12-31T23:59:59";
    const endDate = new Date(targetDate).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('Khuyến mãi đã hết hạn');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`Còn ${days} Ngày ${hours} Giờ ${minutes} Phút ${seconds} Giây`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- LOGIC MỚI 2: TÍCH CHỌN PHỤ KIỆN LƯU LOCAL STORAGE ---
  const accessoryIds = [
    { id: "earphone", label: "Tai nghe Gaming" },
    { id: "keyboard", label: "Bàn phím cơ" },
    { id: "mouse", label: "Chuột không dây" },
    { id: "RAM", label: "Nâng cấp RAM" },
    { id: "monitor", label: "Màn hình rời" }
  ];
  
  const [accessories, setAccessories] = useState(() => {
    const saved = {};
    accessoryIds.forEach(acc => {
      saved[acc.id] = localStorage.getItem(acc.id) === 'true';
    });
    return saved;
  });

  useEffect(() => {
    Object.keys(accessories).forEach(id => {
      localStorage.setItem(id, accessories[id]);
    });
  }, [accessories]);

  const handleCheckboxChange = (id) => {
    setAccessories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- LOGIC GỐC: API CALL ---
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const productData = res.data.product || res.data;
        const related = res.data.relatedProducts || [];
        
        setProduct(productData);
        setRelatedProducts(related);
        setMainImage(productData.image);
        setQuantity(1); 
      } catch (error) {
        console.error("Lỗi tải chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const getImageUrl = (img) => {
    if (!img) return '/assets/placeholder.jpg';
    return img.startsWith('assets/') ? `/${img}` : `/assets/${img}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = async () => {
    setIsProcessing(true);
    try {
      await api.post('/cart/add', { productId: id, quantity: quantity });
      alert("Đã thêm sản phẩm vào giỏ hàng!");
      window.location.reload(); 
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Vui lòng đăng nhập để mua hàng!");
        navigate('/dangnhap');
      } else {
        alert("Có lỗi xảy ra khi thêm vào giỏ hàng.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    setIsProcessing(true);
    try {
      await api.post('/cart/add', { productId: id, quantity: quantity });
      navigate('/cart');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Vui lòng đăng nhập để mua hàng!");
        navigate('/dangnhap');
      } else {
        alert("Có lỗi xảy ra.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-gray-500">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* ================= THÔNG TIN SẢN PHẨM ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row mb-12">
          
          {/* Cột trái: Gallery Ảnh */}
          <div className="w-full lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="h-80 md:h-96 flex items-center justify-center mb-4 p-4 border border-gray-100 rounded-xl bg-white">
              <img src={getImageUrl(mainImage)} alt={product.name} className="max-h-full max-w-full object-contain transition-opacity duration-300" />
            </div>
            
            {/* Ảnh Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                <img 
                  src={getImageUrl(product.image)} 
                  onClick={() => setMainImage(product.image)}
                  className={`h-20 w-20 object-contain p-1 border-2 rounded-lg cursor-pointer flex-shrink-0 transition-colors ${mainImage === product.image ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                  alt="Thumb main"
                />
                {product.images.filter(img => img.imageUrl !== product.image).map((img, index) => (
                  <img 
                    key={index}
                    src={getImageUrl(img.imageUrl)} 
                    onClick={() => setMainImage(img.imageUrl)}
                    className={`h-20 w-20 object-contain p-1 border-2 rounded-lg cursor-pointer flex-shrink-0 transition-colors ${mainImage === img.imageUrl ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                    alt={`Thumb ${index}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin & Đặt hàng */}
          <div className="w-full lg:w-7/12 p-6 lg:p-10 flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            
            {/* HIỂN THỊ ĐẾM NGƯỢC */}
            <div className="text-red-600 font-bold bg-red-50 border border-red-100 px-4 py-2 rounded-lg inline-flex items-center gap-2 w-fit mb-4 text-sm">
              <i className="fas fa-clock animate-pulse"></i> {timeLeft}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium mb-6 pb-4 border-b border-gray-100">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{product.productDetail?.conditionStatus || 'Mới 100%'}</span>
              <span className="text-teal-600"><i className="fas fa-check-circle mr-1"></i> Bảo hành chính hãng</span>
              <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Kho: {product.stock} máy</span>
            </div>
            
            <div className="text-4xl font-extrabold text-red-600 mb-8">
              {formatPrice(product.price)}
            </div>
            
            {/* Thông số cấu hình */}
            {product.productDetail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="flex"><span className="text-gray-500 w-24"><i className="fas fa-microchip mr-2"></i> CPU:</span> <span className="font-semibold text-gray-800">{product.productDetail.cpu}</span></div>
                <div className="flex"><span className="text-gray-500 w-24"><i className="fas fa-memory mr-2"></i> RAM:</span> <span className="font-semibold text-gray-800">{product.productDetail.ram}</span></div>
                <div className="flex"><span className="text-gray-500 w-24"><i className="fas fa-hdd mr-2"></i> Ổ cứng:</span> <span className="font-semibold text-gray-800">{product.productDetail.storage}</span></div>
                <div className="flex"><span className="text-gray-500 w-24"><i className="fas fa-desktop mr-2"></i> Màn hình:</span> <span className="font-semibold text-gray-800">{product.productDetail.screen}</span></div>
                <div className="flex"><span className="text-gray-500 w-24"><i className="fas fa-gamepad mr-2"></i> VGA:</span> <span className="font-semibold text-gray-800 md:col-span-1 truncate" title={product.productDetail.gpu}>{product.productDetail.gpu}</span></div>
                <div className="flex"><span className="text-gray-500 w-24"><i className="fas fa-weight-hanging mr-2"></i> Nặng:</span> <span className="font-semibold text-gray-800">{product.productDetail.weight}</span></div>
              </div>
            )}

            {/* HIỂN THỊ PHỤ KIỆN MUA KÈM */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
              <h4 className="font-bold text-gray-800 mb-3 text-sm"><i className="fas fa-headphones mr-2 text-blue-600"></i>Mua kèm phụ kiện</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {accessoryIds.map(acc => (
                  <label key={acc.id} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={accessories[acc.id]} 
                      onChange={() => handleCheckboxChange(acc.id)}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span className="font-medium">{acc.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hộp Ưu đãi */}
            <div className="bg-green-50 border border-dashed border-green-500 rounded-xl p-4 mb-8">
              <h6 className="text-green-700 font-bold mb-2"><i className="fas fa-gift mr-1"></i> Ưu đãi đặc biệt khi mua tại LapZone</h6>
              <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                <li>Tặng Balo Laptop LapZone cao cấp & Chuột không dây.</li>
                <li>Giảm thêm 5% (Tối đa 500k) cho Học sinh - Sinh viên.</li>
                <li>Hỗ trợ cài đặt Windows và vệ sinh máy miễn phí trọn đời.</li>
                <li>Giao hàng hỏa tốc trong 2 giờ nội thành.</li>
              </ul>
            </div>

            {/* Hành động mua hàng */}
            <div className="mt-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center mb-4">
                <label className="font-semibold text-gray-700 mr-4">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">-</button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                    className="w-16 text-center font-bold focus:outline-none"
                    min="1" max={product.stock}
                  />
                  <button type="button" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors">+</button>
                </div>
                <span className="ml-4 text-sm text-gray-500">(Còn {product.stock} máy)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isProcessing || product.stock === 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center transition-all ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'}`}
                >
                  <i className="fas fa-shopping-cart mr-2"></i> {isProcessing ? 'Đang xử lý...' : 'THÊM VÀO GIỎ'}
                </button>
                <button 
                  onClick={handleBuyNow}
                  disabled={isProcessing || product.stock === 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center transition-all shadow-md ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-lg'}`}
                >
                  MUA NGAY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SẢN PHẨM LIÊN QUAN ================= */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-12">
            <h4 className="text-xl font-bold mb-6 border-b pb-2 text-gray-900"><i className="fas fa-laptop text-blue-600 mr-2"></i> Có thể bạn cũng thích</h4>
            
            <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar">
              {relatedProducts.map(p => (
                <div key={p.id} className="flex-none w-64 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                  <Link to={`/product_detail/${p.id}`} className="block p-4 h-full flex flex-col">
                    <div className="h-40 flex items-center justify-center mb-4">
                      <img src={getImageUrl(p.image)} alt={p.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h6 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600">{p.name}</h6>
                    <p className="text-red-600 font-bold mt-auto">{formatPrice(p.price)}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}