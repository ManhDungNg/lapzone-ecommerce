import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';

export default function OrderLookup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    orderId: '',
    customerPhone: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gọi API tra cứu đơn hàng theo Swagger
      await api.post('/orders/lookup', {
        orderId: formData.orderId,
        customerPhone: formData.customerPhone
      });
      
      // Nếu API trả về thành công (không ném ra lỗi), chuyển hướng sang trang Chi tiết hóa đơn
      navigate(`/orders/${formData.orderId}`);
      
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.message || 'Mã đơn hàng hoặc số điện thoại không chính xác.');
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          
          <div className="text-center mb-8">
            <i className="fas fa-search-dollar text-blue-600 text-6xl mb-4 drop-shadow-sm"></i>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-2">Tra Cứu Đơn Hàng</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Nhập mã đơn hàng và số điện thoại mua hàng để xem lại hóa đơn của bạn.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-center text-sm font-semibold flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mã đơn hàng (#)</label>
              <input 
                type="number" 
                name="orderId" 
                value={formData.orderId}
                onChange={handleChange}
                required 
                placeholder="Ví dụ: 15"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại đặt hàng</label>
              <input 
                type="tel" 
                name="customerPhone" 
                value={formData.customerPhone}
                onChange={handleChange}
                required 
                placeholder="Nhập số điện thoại..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-blue-400 mt-2 text-lg"
            >
              <i className="fas fa-search"></i> {isLoading ? 'ĐANG TÌM KIẾM...' : 'TRA CỨU NGAY'}
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}