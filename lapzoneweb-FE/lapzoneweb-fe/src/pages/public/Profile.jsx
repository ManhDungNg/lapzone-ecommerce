import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Lấy thông tin người dùng khi load trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setFormData({
          email: res.data.email || '',
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
          address: res.data.address || ''
        });
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
          navigate('/dangnhap');
        } else {
          setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý lưu cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);
    
    try {
      await api.put('/profile', formData);
      setMessage('Cập nhật thông tin thành công!');
      
      // Nếu có cập nhật tên, lưu lại vào localStorage để Header hiển thị đúng
      if (formData.fullName) {
        localStorage.setItem('userName', formData.fullName);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.');
      } else {
        setError('Không thể kết nối máy chủ.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-lg p-8 sm:p-10 rounded-2xl shadow-xl transition-transform duration-300 hover:-translate-y-1 border border-gray-100">
        
        {/* Header Hồ Sơ */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg shadow-blue-600/30">
            <i className="fas fa-user-astronaut"></i>
          </div>
          <h2 className="text-2xl font-bold text-blue-600 m-0">Thông Tin Tài Khoản</h2>
          <p className="text-gray-500 mt-2 text-sm">Quản lý thông tin cá nhân của bạn tại Lapzone</p>
        </div>

        {/* Thông báo động */}
        {message && <div className="bg-green-100 text-green-800 border border-green-200 p-3 rounded-lg mb-5 text-center font-bold">{message}</div>}
        {error && <div className="bg-red-100 text-red-800 border border-red-200 p-3 rounded-lg mb-5 text-center font-bold">{error}</div>}

        {/* Form Cập Nhật */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-envelope text-blue-600 w-5"></i> Địa chỉ Email
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              readOnly
              title="Email đăng nhập không thể thay đổi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-id-card text-blue-600 w-5"></i> Họ và tên
            </label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-phone-alt text-blue-600 w-5"></i> Số điện thoại
            </label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại liên hệ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-map-marker-alt text-blue-600 w-5"></i> Địa chỉ giao hàng
            </label>
            <input 
              type="text" 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ nhận laptop..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex gap-4 mt-8 pt-4">
            <Link to="/" className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-bold text-center hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
              <i className="fas fa-arrow-left"></i> Về cửa hàng
            </Link>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-center hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              <i className="fas fa-save"></i> {isSaving ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}