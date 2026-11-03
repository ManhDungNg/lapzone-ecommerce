import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Khi PayOS gọi về hoặc COD nhảy sang, có thể sẽ không có location.state nếu gọi qua URL redirect
  // Ở một hệ thống thực tế bạn có thể gọi API kiểm tra trạng thái đơn, ở đây ta hiển thị giao diện thành công.
  const { orderId, totalAmount, paymentMethod } = location.state || { orderId: "LAPZONE" };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-2xl w-full text-center transform transition-all duration-500 translate-y-0 opacity-100">
          
          <div className="text-green-600 text-7xl mb-6 animate-bounce">
            <i className="fas fa-check-circle"></i>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Đặt Hàng Thành Công!</h2>
          <p className="text-gray-500 text-lg mb-6">Cảm ơn bạn đã tin tưởng và lựa chọn sản phẩm tại <strong className="text-gray-800">Lapzone</strong>.</p>
          
          <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold inline-block mb-6 border border-green-200">
            Trạng thái: Đã ghi nhận đơn hàng {orderId !== "LAPZONE" ? `#${orderId}` : ''}
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Nhân viên Lapzone sẽ sớm liên hệ với bạn qua số điện thoại để xác nhận đơn hàng và thời gian giao hàng.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center">
              <i className="fas fa-home mr-2"></i> Về trang chủ
            </Link>
            <Link to="/profile" className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center">
              <i className="fas fa-list-alt mr-2"></i> Xem đơn hàng
            </Link>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Bạn cần hỗ trợ? Gọi ngay <strong className="text-blue-600 text-base">1900 1234</strong> (Miễn phí)
            </p>
          </div>
          
        </div>
      </div>
      
      <footer className="py-4 bg-white border-t border-gray-200 text-center">
        <p className="mb-0 text-gray-400 text-sm">&copy; 2026 Lapzone - Laptop Gaming & Workstation</p>
      </footer>
    </div>
  );
}