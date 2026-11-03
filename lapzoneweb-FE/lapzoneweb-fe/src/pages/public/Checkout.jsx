import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedItemIds = location.state?.selectedItems || [];
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    if (selectedItemIds.length === 0) {
      alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
      navigate('/cart');
      return;
    }
    const fetchCheckoutData = async () => {
      try {
        const profileRes = await api.get('/profile');
        if (profileRes.data) {
          setFormData(prev => ({
            ...prev,
            customerName: profileRes.data.fullName || '',
            customerPhone: profileRes.data.phone || '',
            address: profileRes.data.address || ''
          }));
        }
        
        const cartRes = await api.get('/cart');
        const allItems = cartRes.data.cartItems || cartRes.data || [];
        const itemsToBuy = allItems.filter(item => selectedItemIds.includes(item.id));
        
        setCartItems(itemsToBuy);
      } catch (error) {
        console.error("Lỗi tải thông tin thanh toán:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutData();
  }, [navigate, selectedItemIds]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xử lý chốt đơn hàng tích hợp PayOS
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const listIds = cartItems.map(item => item.id);
      
      const res = await api.post('/checkout/process', {
        ...formData,
        selectedItemIds: listIds 
      });
      
      // Nếu là chuyển khoản, nhảy sang cổng PayOS
      if (formData.paymentMethod === 'CHUYEN_KHOAN' && res.data && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl; 
      } else {
        // Nếu là COD, sang trang thành công luôn
        navigate('/thanh-toan-thanh-cong', {
          state: {
            orderId: res.data.orderId || "LAP" + Math.floor(Math.random() * 100000),
            totalAmount: totalAmount,
            paymentMethod: formData.paymentMethod
          }
        });
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      alert("Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <i className="fas fa-shipping-fast text-blue-600 mr-3"></i> Thông Tin Nhận Hàng
                </h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmitOrder} id="checkoutForm">
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên người nhận</label>
                    <input 
                      type="text" name="customerName" required
                      value={formData.customerName} onChange={handleChange}
                      placeholder="Nhập tên người nhận"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                    <input 
                      type="tel" name="customerPhone" required
                      value={formData.customerPhone} onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</label>
                    <textarea 
                      name="address" rows="3" required
                      value={formData.address} onChange={handleChange}
                      placeholder="Nhập địa chỉ nhận hàng"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    ></textarea>
                  </div>

                  {/* PHƯƠNG THỨC THANH TOÁN */}
                  <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fas fa-credit-card text-gray-500 mr-2"></i> Phương thức thanh toán
                  </h4>
                  
                  <div className="space-y-3">
                    {/* COD */}
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" name="paymentMethod" value="COD"
                        checked={formData.paymentMethod === 'COD'} onChange={handleChange}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 mr-4"
                      />
                      <i className="fas fa-money-bill-wave text-green-500 text-2xl mr-4 w-8 text-center"></i>
                      <div>
                        <div className={`font-bold ${formData.paymentMethod === 'COD' ? 'text-blue-700' : 'text-gray-800'}`}>Thanh toán khi nhận hàng (COD)</div>
                        <div className="text-sm text-gray-500">Bạn sẽ thanh toán tiền mặt khi shipper giao máy.</div>
                      </div>
                    </label>
                    
                    {/* CHUYỂN KHOẢN PAYOS */}
                    <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'CHUYEN_KHOAN' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" name="paymentMethod" value="CHUYEN_KHOAN"
                        checked={formData.paymentMethod === 'CHUYEN_KHOAN'} onChange={handleChange}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 mr-4"
                      />
                      <i className="fas fa-qrcode text-blue-600 text-2xl mr-4 w-8 text-center"></i>
                      <div>
                        <div className={`font-bold ${formData.paymentMethod === 'CHUYEN_KHOAN' ? 'text-blue-700' : 'text-gray-800'}`}>Chuyển khoản ngân hàng (VietQR)</div>
                        <div className="text-sm text-gray-500">Quét mã QR tự động xác nhận qua hệ thống PayOS.</div>
                      </div>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl uppercase tracking-wide shadow-md transition-all disabled:bg-blue-400 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'} <i className="fas fa-check-circle"></i>
                  </button>
                </form>
              </div>
            </div>
            
            <Link to="/cart" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium">
              <i className="fas fa-arrow-left mr-2"></i> Quay lại giỏ hàng
            </Link>
          </div>

          {/* CỘT PHẢI */}
          <div className="w-full lg:w-5/12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-white px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <i className="fas fa-shopping-bag text-blue-600 mr-3"></i> Đơn Hàng Của Bạn
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center py-3 border-b border-gray-100 border-dashed last:border-0">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 mr-4 border border-gray-100 flex-shrink-0">
                        <img 
                          src={item.product.image?.startsWith('assets/') ? `/${item.product.image}` : `/assets/${item.product.image}`} 
                          alt={item.product.name} className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <h6 className="font-semibold text-gray-800 text-sm line-clamp-2">{item.product.name}</h6>
                        <div className="text-gray-500 text-sm mt-1">{formatPrice(item.product.price)}</div>
                      </div>
                      <div className="ml-4 font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                        x{item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-semibold">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-100">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-gray-800">TỔNG CỘNG:</span>
                    <span className="text-2xl font-extrabold text-red-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}