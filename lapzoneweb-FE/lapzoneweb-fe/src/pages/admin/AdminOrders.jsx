import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [filters, setFilters] = useState({ keyword: '', status: '', startDate: '', endDate: '' });

const fetchOrders = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', { params: currentFilters });
      console.log("=== DỮ LIỆU TỪ BACKEND ===", res.data); // In ra console để debug

      let orderArray = [];
      let rawData = res.data;

      // 1. Quét tìm mảng đơn hàng ở các vị trí thường gặp nhất
      if (Array.isArray(rawData)) {
          orderArray = rawData;
      } else if (rawData && typeof rawData === 'object') {
          if (Array.isArray(rawData.orders)) {
              orderArray = rawData.orders;
          } else if (rawData.orders?.content && Array.isArray(rawData.orders.content)) {
              orderArray = rawData.orders.content;
          } else if (Array.isArray(rawData.content)) {
              orderArray = rawData.content;
          } else if (Array.isArray(rawData.data)) {
              orderArray = rawData.data;
          } 
          // 2. Kỹ thuật càn quét: Tự động tìm bất kỳ mảng nào tồn tại trong JSON
          else {
              for (const key in rawData) {
                  if (Array.isArray(rawData[key])) {
                      orderArray = rawData[key];
                      break;
                  }
              }
          }
      }

      setOrders(orderArray);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!');
        navigate('/dangnhap');
      } else {
        setMessage({ type: 'error', text: 'Không thể tải danh sách đơn hàng.' });
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchOrders(); }, [navigate]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = (e) => { e.preventDefault(); fetchOrders(filters); };

  const handleUpdateStatus = async (orderId, newStatus, e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await api.put(`/admin/orders/update-status`, { orderId, newStatus });
      setMessage({ type: 'success', text: `Cập nhật trạng thái đơn hàng #${orderId} thành công!` });
      fetchOrders(); 
    } catch (error) {
      setMessage({ type: 'error', text: 'Cập nhật trạng thái thất bại. Vui lòng thử lại.' });
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('vi-VN') : '';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CHỜ XÁC NHẬN': return 'bg-yellow-100 text-yellow-800';
      case 'ĐANG ĐÓNG GÓI': return 'bg-blue-100 text-blue-800';
      case 'ĐANG GIAO HÀNG': return 'bg-teal-100 text-teal-800';
      case 'HOÀN THÀNH': return 'bg-green-100 text-green-800';
      case 'ĐÃ HỦY': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Gọi Component Sidebar Dùng Chung Ở Đây */}
      <AdminSidebar />

      {/* NỘI DUNG CHÍNH LÙI VÀO 264px (ml-64) */}
      <main className="ml-64 p-8 w-[calc(100%-256px)]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="bg-white py-5 px-6 border-b border-gray-100 flex items-center justify-between">
            <h4 className="m-0 font-bold text-blue-600 text-xl flex items-center">
              <i className="fas fa-boxes mr-3"></i> QUẢN LÝ ĐƠN HÀNG
            </h4>
          </div>

          <div className="p-6">
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <div className="col-span-12 md:col-span-3">
                <input type="text" name="keyword" value={filters.keyword} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mã đơn, Tên, SĐT..." />
              </div>
              <div className="col-span-12 md:col-span-3">
                <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">-- Trạng thái --</option>
                  <option value="CHỜ XÁC NHẬN">Chờ xác nhận</option>
                  <option value="ĐANG ĐÓNG GÓI">Đang đóng gói</option>
                  <option value="ĐANG GIAO HÀNG">Đang giao hàng</option>
                  <option value="HOÀN THÀNH">Hoàn thành</option>
                  <option value="ĐÃ HỦY">Đã hủy</option>
                </select>
              </div>
              <div className="col-span-12 md:col-span-2">
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} title="Từ ngày" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-2">
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} title="Đến ngày" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center">
                  <i className="fas fa-filter mr-2"></i> Lọc
                </button>
              </div>
            </form>

            {message.text && (
              <div className={`px-4 py-3 rounded-xl mb-6 font-bold flex items-center justify-between ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                <div><i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>{message.text}</div>
                <button onClick={() => setMessage({type:'', text:''})} className="text-lg leading-none hover:opacity-70">&times;</button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-sm">
                    <tr>
                      <th className="py-3 px-4 w-24">Mã đơn</th>
                      <th className="py-3 px-4">Khách hàng</th>
                      <th className="py-3 px-4 w-40">Ngày đặt</th>
                      <th className="py-3 px-4 w-32">Tổng tiền</th>
                      <th className="py-3 px-4 w-32">Thanh toán</th>
                      <th className="py-3 px-4 w-36">Trạng thái</th>
                      <th className="py-3 px-4 text-center w-56">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                      <tr><td colSpan="7" className="py-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-800">#{order.id}</td>
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-800">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-sm">{formatDate(order.orderDate)}</td>
                          <td className="py-4 px-4 font-bold text-red-600">{formatPrice(order.totalAmount)}</td>
                          <td className="py-4 px-4">
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">{order.paymentMethod}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(order.status)}`}>{order.status || 'CHỜ XÁC NHẬN'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <form onSubmit={(e) => handleUpdateStatus(order.id, e.target.newStatus.value, e)} className="flex items-center justify-center gap-2">
                              <select name="newStatus" defaultValue={order.status} className="px-2 py-1.5 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-32 shadow-sm">
                                <option value="CHỜ XÁC NHẬN">Xác nhận</option>
                                <option value="ĐANG ĐÓNG GÓI">Đóng gói</option>
                                <option value="ĐANG GIAO HÀNG">Giao hàng</option>
                                <option value="HOÀN THÀNH">Hoàn thành</option>
                                <option value="ĐÃ HỦY">Hủy đơn</option>
                              </select>
                              <button type="submit" className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm transition-colors" title="Lưu trạng thái"><i className="fas fa-save"></i></button>
                            </form>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}