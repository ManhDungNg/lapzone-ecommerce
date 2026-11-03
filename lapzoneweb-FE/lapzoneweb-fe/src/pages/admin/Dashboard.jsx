import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

// Đăng ký các thành phần của Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Quản trị viên';

  // State bộ lọc thời gian
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State dữ liệu dashboard
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    countProducts: 0,
    countUsers: 0,
    countOrders: 0,
    totalRevenue: 0,
    orders: [],
    revenueChartLabels: ['Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
    revenueChartData: [120, 190, 80, 250, 180, 210],
    categoryChartLabels: ['Dell', 'Asus', 'HP', 'Lenovo', 'Macbook'],
    categoryChartData: [35, 25, 20, 10, 10]
  });

  // Gọi API lấy dữ liệu Dashboard[cite: 3]
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/admin/dashboard', { params });
      
      // Merge dữ liệu API trả về với state hiện tại (Dự phòng nếu backend chưa có chart data)
      setDashboardData(prev => ({
        ...prev,
        ...res.data
      }));
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Bạn không có quyền truy cập trang quản trị!');
        navigate('/dangnhap');
      } else {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  // Xử lý xuất CSV (Bảo vệ bằng JWT Token)[cite: 3]
  const handleExportCSV = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/admin/dashboard/export', { 
        params, 
        responseType: 'blob' // Quan trọng để tải file
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_doanh_thu_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Lỗi khi xuất báo cáo CSV!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      <AdminSidebar />

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <main className="ml-64 p-8 w-[calc(100%-256px)] overflow-y-auto print:m-0 print:w-full print:p-0">
        
        {/* Top Bar */}
        <div className="bg-white px-6 py-4 rounded-xl mb-8 flex justify-between items-center shadow-sm print:hidden">
          <div className="text-gray-500 font-bold"><i className="fas fa-home mr-2"></i> Bảng điều khiển / Tổng quan</div>
          <div className="font-bold text-gray-800">
            <i className="fas fa-user-shield text-blue-600 mr-2"></i> Xin chào, <span className="text-blue-600">{userName}</span>
          </div>
        </div>

        {/* Welcome Box */}
        <div className="bg-gradient-to-br from-teal-400 to-blue-500 text-white p-8 rounded-2xl mb-8 relative overflow-hidden shadow-lg print:hidden">
          <h2 className="text-3xl font-extrabold mb-2">CHÀO MỪNG QUẢN TRỊ VIÊN</h2>
          <p className="opacity-90 m-0 text-lg">Hệ thống quản lý cửa hàng thương mại điện tử LapZone</p>
          <i className="fas fa-laptop-code absolute -right-4 -top-8 text-9xl opacity-20 transform rotate-12"></i>
        </div>

        {/* Filter Box */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 print:hidden">
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-500 font-bold mb-2">Từ ngày:</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-500 font-bold mb-2">Đến ngày:</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors flex items-center">
                <i className="fas fa-filter mr-2"></i> Lọc số liệu
              </button>
              <button type="button" onClick={handlePrint} className="border border-green-500 text-green-600 hover:bg-green-50 font-bold px-6 py-2 rounded-lg transition-colors flex items-center">
                <i className="fas fa-print mr-2"></i> In Báo Cáo
              </button>
              <button type="button" onClick={handleExportCSV} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg transition-colors flex items-center">
                <i className="fas fa-file-csv mr-2"></i> Xuất (CSV)
              </button>
            </div>
          </form>
        </div>

        {/* Loading Overlay cho dữ liệu */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>
        ) : (
          <>
            {/* 4 Khối thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData.countProducts}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tổng Laptop</div>
                <i className="fas fa-laptop absolute right-4 top-1/2 -translate-y-1/2 text-6xl text-gray-100 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData.countUsers}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Khách hàng</div>
                <i className="fas fa-users absolute right-4 top-1/2 -translate-y-1/2 text-6xl text-gray-100 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-500 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData.countOrders}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đơn hàng (Theo bộ lọc)</div>
                <i className="fas fa-shopping-cart absolute right-4 top-1/2 -translate-y-1/2 text-6xl text-gray-100 group-hover:scale-110 transition-transform"></i>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="text-3xl font-bold text-gray-800 mb-1">{formatPrice(dashboardData.totalRevenue)}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Doanh thu (Theo bộ lọc)</div>
                <i className="fas fa-hand-holding-usd absolute right-4 top-1/2 -translate-y-1/2 text-6xl text-gray-100 group-hover:scale-110 transition-transform"></i>
              </div>
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:hidden">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800 flex items-center">
                  <i className="fas fa-chart-bar text-blue-600 mr-2"></i> Biểu đồ Doanh thu (Triệu VNĐ)
                </div>
                <div className="p-6 h-80">
                  <Bar 
                    data={{
                      labels: dashboardData.revenueChartLabels,
                      datasets: [{ label: 'Doanh thu (Triệu VNĐ)', data: dashboardData.revenueChartData, backgroundColor: 'rgba(52, 152, 219, 0.7)', borderRadius: 4 }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800 flex items-center">
                  <i className="fas fa-chart-pie text-green-500 mr-2"></i> Tỷ trọng Hãng Laptop
                </div>
                <div className="p-6 h-80 flex justify-center">
                  <Doughnut 
                    data={{
                      labels: dashboardData.categoryChartLabels,
                      datasets: [{ data: dashboardData.categoryChartData, backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6'], borderWidth: 0 }]
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, cutout: '65%' }}
                  />
                </div>
              </div>
            </div>

            {/* Bảng đơn hàng */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-white border-b border-gray-100 font-bold text-gray-800 flex items-center">
                <i className="fas fa-list text-blue-600 mr-2"></i> Chi tiết đơn hàng trong kỳ
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                    <tr>
                      <th className="py-3 px-6">Mã ĐH</th>
                      <th className="py-3 px-4">Khách Hàng</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Ngày Lập</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-6 text-right">Tổng Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!dashboardData.orders || dashboardData.orders.length === 0 ? (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-500">Không có đơn hàng nào trong khoảng thời gian này.</td></tr>
                    ) : (
                      dashboardData.orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-6 font-bold text-blue-600">#{order.id}</td>
                          <td className="py-3 px-4 text-gray-800">{order.customerName}</td>
                          <td className="py-3 px-4 text-gray-600">{order.customerPhone}</td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(order.orderDate)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${order.status === 'Đã hủy' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {order.status || 'Hoàn thành'}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right font-bold text-red-600">{formatPrice(order.totalAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
}