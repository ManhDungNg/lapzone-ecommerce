import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-6 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Cột 1: Về Lapzone[cite: 17] */}
          <div>
            <img 
              loading="lazy" 
              src="/assets/logo-lapzone.jpg" 
              alt="Lapzone Logo" 
              className="h-12 mb-6 object-contain bg-white p-1 rounded" 
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Lapzone mang đến cho bạn những sản phẩm công nghệ chất lượng cao, laptop gaming, văn phòng với giá cả và dịch vụ tốt nhất thị trường.
            </p>
          </div>

          {/* Cột 2: Dịch vụ khách hàng[cite: 17] */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wider">Dịch vụ khách hàng</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Bảo mật thông tin</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Giao hàng & Lắp đặt</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Chính sách Đổi trả</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Bảo hành sản phẩm</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition-colors">Trả góp thủ tục nhanh</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hệ thống cửa hàng[cite: 17] */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wider">Hệ thống cửa hàng</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-blue-500 w-4 text-center"></i>
                <span className="leading-snug">Số 3 Ngõ 117 Thái Hà, Đống Đa, Hà Nội</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone mr-3 text-blue-500 w-4 text-center"></i>
                <span>Bán hàng: <strong className="text-white">093 669 3388</strong></span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-headset mr-3 text-blue-500 w-4 text-center"></i>
                <span>Kỹ thuật: <strong className="text-white">0911 992 995</strong></span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-blue-500 w-4 text-center"></i>
                <a href="mailto:contact@lapzone.vn" className="hover:text-blue-400 transition-colors">contact@lapzone.vn</a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Kết nối[cite: 17] */}
          <div>
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wider">Kết nối với chúng tôi</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all text-xl">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all text-xl">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-600 transition-all text-xl">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
            <img 
              loading="lazy" 
              src="/assets/lapzone_banner_footer.png" 
              alt="Banner Footer" 
              className="rounded-lg opacity-80 hover:opacity-100 transition-opacity w-full max-w-[200px]" 
            />
          </div>

        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} LAPZONE. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}