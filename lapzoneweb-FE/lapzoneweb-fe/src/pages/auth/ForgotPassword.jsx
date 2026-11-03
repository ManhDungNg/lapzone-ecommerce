import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Quản lý bước hiện tại: 1 = Xác minh, 2 = Đặt pass mới, 3 = Thành công
  const [step, setStep] = useState(1);
  
  // Lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    newPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Bước 1: Gửi API Xác minh Email & Số điện thoại
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Dựa theo Swagger API Đăng ký và Xác thực tài khoản
      await api.post('/auth/password/verify', {
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      // Nếu thành công, chuyển sang bước 2 (nhập mật khẩu mới)
      setStep(2);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.message || 'Thông tin xác minh không chính xác.');
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Gửi API Đổi mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Dựa theo Swagger API Đăng ký và Xác thực tài khoản
      await api.post('/auth/password/reset', {
        email: formData.email, // Gửi kèm email đã xác minh
        newPassword: formData.newPassword
      });
      setMessage('Khôi phục mật khẩu thành công!');
      setStep(3); // Chuyển sang màn hình báo thành công
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.message || 'Không thể đổi mật khẩu.');
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 
        Sử dụng border-top linh hoạt: 
        Bước 1: Màu đỏ (red-600) giống thẻ cũ
        Bước 2 & 3: Màu xanh (green-500) giống thẻ cũ
      */}
      <div className={`bg-white rounded-lg shadow-xl p-8 w-full max-w-md border-t-4 ${step === 1 ? 'border-red-600' : 'border-green-500'}`}>
        
        {/* Tiêu đề linh động theo từng bước */}
        <h3 className={`text-center text-3xl font-extrabold mb-2 tracking-tight ${step === 1 ? 'text-red-600' : 'text-green-600'}`}>
          LAPZONE
        </h3>
        
        {step === 1 && <h5 className="text-center text-gray-700 font-semibold mb-6">Xác minh tài khoản</h5>}
        {step === 2 && <h5 className="text-center text-gray-700 font-semibold mb-6">Tạo mật khẩu mới</h5>}
        
        {/* Hiển thị lỗi chung */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* ================= BƯỚC 1: XÁC MINH ================= */}
        {step === 1 && (
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Email đăng nhập</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required 
                placeholder="Nhập email..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại đăng ký</label>
              <input 
                type="text" 
                name="phoneNumber" 
                value={formData.phoneNumber}
                onChange={handleChange}
                required 
                placeholder="Nhập số điện thoại..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-red-400"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác Nhận & Tiếp Tục'}
            </button>
            
            <div className="text-center mt-6">
              <Link to="/dangnhap" className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* ================= BƯỚC 2: ĐỔI MẬT KHẨU ================= */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
              <input 
                type="password" 
                name="newPassword" 
                value={formData.newPassword}
                onChange={handleChange}
                required 
                minLength="6"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-green-400"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu Mật Khẩu'}
            </button>
          </form>
        )}

        {/* ================= BƯỚC 3: THÀNH CÔNG ================= */}
        {step === 3 && (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 font-medium">
              {message}
            </div>
            <Link 
              to="/dangnhap" 
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
            >
              Đi tới Đăng nhập
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}