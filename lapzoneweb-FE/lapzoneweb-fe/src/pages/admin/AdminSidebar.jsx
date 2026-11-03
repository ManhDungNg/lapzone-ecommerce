import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-800 text-white fixed top-0 left-0 flex flex-col shadow-xl z-50 print:hidden">
      <div className="text-xl font-extrabold text-center py-6 tracking-wider text-teal-400 border-b border-slate-700 bg-slate-900">
        LAPZONE ADMIN
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <Link to="/admin/dashboard" className="flex items-center gap-3 px-6 py-4 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:pl-8 transition-all">
          <i className="fas fa-chart-line w-6 text-center"></i> <span>Tổng quan</span>
        </Link>
        <Link to="/admin/products" className="flex items-center gap-3 px-6 py-4 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:pl-8 transition-all">
          <i className="fas fa-laptop w-6 text-center"></i> <span>Quản lý sản phẩm</span>
        </Link>
        <Link to="/admin/users" className="flex items-center gap-3 px-6 py-4 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:pl-8 transition-all">
          <i className="fas fa-users-cog w-6 text-center"></i> <span>Quản lý khách hàng</span>
        </Link>
        <Link to="/admin/orders" className="flex items-center gap-3 px-6 py-4 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:pl-8 transition-all">
          <i className="fas fa-boxes w-6 text-center"></i> <span>Quản lý Đơn hàng</span>
        </Link>
        <Link to="/admin/invoices" className="flex items-center gap-3 px-6 py-4 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:pl-8 transition-all">
          <i className="fas fa-file-invoice-dollar w-6 text-center"></i> <span>Quản lý Hóa đơn</span>
        </Link>
        <Link to="/admin/categories" className="flex items-center gap-3 px-6 py-4 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:pl-8 transition-all">
          <i className="fas fa-tags w-6 text-center"></i> <span>Quản lý Danh mục</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-700 mt-auto">
        <Link to="/" className="flex items-center gap-3 px-6 py-3 text-red-400 hover:text-red-300 transition-colors">
          <i className="fas fa-sign-out-alt w-6 text-center"></i> <span>Thoát về trang chủ</span>
        </Link>
      </div>
    </aside>
  );
}