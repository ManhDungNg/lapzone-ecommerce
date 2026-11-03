import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

export default function AdminInvoices() {
  const navigate = useNavigate();
  
  const [invoices, setInvoices] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State bộ lọc
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  // State cho Modal Sửa Hóa Đơn
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: '', customerName: '', customerPhone: '', address: '', totalAmount: '', status: ''
  });

const fetchInvoices = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/invoices', { params: currentFilters });
      
      let rawData = res.data;
      let invoiceArray = [];
      
      if (Array.isArray(rawData)) {
          invoiceArray = rawData;
      } else if (rawData?.invoices && Array.isArray(rawData.invoices)) {
          invoiceArray = rawData.invoices;
      } else if (rawData?.content && Array.isArray(rawData.content)) {
          invoiceArray = rawData.content;
      } else if (rawData?.data && Array.isArray(rawData.data)) {
          invoiceArray = rawData.data;
      }

      setInvoices(invoiceArray);
      setMonthlyRevenue(rawData?.monthlyRevenue || 0);

    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!');
        navigate('/dangnhap');
      } else {
        setMessage({ type: 'error', text: 'Không thể tải danh sách hóa đơn.' });
      }
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [navigate]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchInvoices(filters);
  };

  // --- Xử lý Xuất Excel ---
  const handleExportExcel = async () => {
    try {
      const res = await api.get('/admin/invoices/export-excel', { 
        params: filters, 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DS_HoaDon_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi xuất file Excel!' });
    }
  };

  // --- Xử lý Xóa Hóa Đơn ---
  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN hóa đơn này không? Thao tác này sẽ xóa sạch cả chi tiết hóa đơn và không thể khôi phục!')) return;
    
    try {
      await api.delete(`/admin/invoices/${invoiceId}`);
      setMessage({ type: 'success', text: `Xóa hóa đơn #${invoiceId} thành công!` });
      fetchInvoices();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xóa hóa đơn này.' });
    }
  };

  // --- Xử lý Mở Modal và Cập Nhật ---
  const openEditModal = (invoice) => {
    setEditData({
      id: invoice.id,
      customerName: invoice.customerName || '',
      customerPhone: invoice.customerPhone || '',
      address: invoice.address || '',
      totalAmount: invoice.totalAmount || 0,
      status: invoice.status || 'HOÀN THÀNH'
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/invoices/${editData.id}`, editData);
      setMessage({ type: 'success', text: `Cập nhật hóa đơn #${editData.id} thành công!` });
      setShowEditModal(false);
      fetchInvoices();
    } catch (error) {
      alert('Cập nhật hóa đơn thất bại. Vui lòng thử lại.');
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString('vi-VN') : '';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Component Sidebar Dùng Chung */}
      <AdminSidebar />

      {/* Nội dung chính */}
      <main className="ml-64 p-8 w-[calc(100%-256px)]">
        
        {/* Thẻ Doanh Thu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-600 text-white rounded-2xl shadow-md flex items-center justify-between p-6">
            <div>
              <h6 className="text-green-100 uppercase font-bold text-sm tracking-wider mb-2">Doanh thu tháng này</h6>
              <h2 className="text-3xl font-extrabold">{formatPrice(monthlyRevenue)}</h2>
            </div>
            <i className="fas fa-hand-holding-usd text-5xl opacity-40"></i>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-500 font-bold mb-2">Từ ngày:</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-gray-500 font-bold mb-2">Đến ngày:</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex-none">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center">
                <i className="fas fa-filter mr-2"></i> Lọc hóa đơn
              </button>
            </div>
          </form>
        </div>

        {/* Khung Bảng Hóa Đơn */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="bg-white py-5 px-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <h5 className="m-0 font-bold text-green-600 text-lg flex items-center">
              <i className="fas fa-file-invoice-dollar mr-2 text-xl"></i> CHỨNG TỪ KẾ TOÁN
            </h5>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="border border-green-500 text-green-600 hover:bg-green-50 font-bold px-4 py-2 rounded-lg transition-colors flex items-center">
                <i className="fas fa-print mr-2"></i> In Báo Cáo
              </button>
              <button onClick={handleExportExcel} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center">
                <i className="fas fa-file-excel mr-2"></i> Xuất Excel
              </button>
            </div>
          </div>

          <div className="p-6">
            {message.text && (
              <div className={`px-4 py-3 rounded-xl mb-6 font-bold flex items-center justify-between ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div><i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>{message.text}</div>
                <button onClick={() => setMessage({type:'', text:''})} className="text-xl leading-none hover:opacity-70">&times;</button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                    <tr className="text-center">
                      <th className="py-3 px-4 border border-gray-200">Mã HĐ</th>
                      <th className="py-3 px-4 border border-gray-200 text-left">Khách hàng</th>
                      <th className="py-3 px-4 border border-gray-200">Ngày thanh toán</th>
                      <th className="py-3 px-4 border border-gray-200">Tổng tiền</th>
                      <th className="py-3 px-4 border border-gray-200">Trạng thái</th>
                      <th className="py-3 px-4 border border-gray-200 w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.length === 0 ? (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-500">Chưa có hóa đơn nào hoàn thành.</td></tr>
                    ) : (
                      invoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-800 text-center border border-gray-200">#{invoice.id}</td>
                          <td className="py-4 px-4 border border-gray-200">
                            <strong className="text-gray-900 block">{invoice.customerName}</strong>
                            <div className="text-sm text-gray-500 mt-1"><i className="fas fa-phone mr-1"></i> {invoice.customerPhone}</div>
                            <div className="text-sm text-gray-500 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {invoice.address}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-center border border-gray-200">{formatDate(invoice.orderDate)}</td>
                          <td className="py-4 px-4 font-bold text-red-600 text-right border border-gray-200">{formatPrice(invoice.totalAmount)}</td>
                          <td className="py-4 px-4 text-center border border-gray-200">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                              <i className="fas fa-check-circle mr-1"></i> {invoice.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 border border-gray-200">
                            <div className="flex justify-center gap-2">
                              {/* Nút xem chi tiết Hóa đơn dùng link cũ đã tạo */}
                              <Link to={`/orders/${invoice.id}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="In Hóa Đơn">
                                <i className="fas fa-print"></i>
                              </Link>
                              <button onClick={() => openEditModal(invoice)} className="w-8 h-8 flex items-center justify-center rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors" title="Sửa thông tin">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button onClick={() => handleDelete(invoice.id)} className="w-8 h-8 flex items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Xóa hóa đơn">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
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

      {/* ================= MODAL SỬA HÓA ĐƠN ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <form onSubmit={handleUpdateInvoice}>
              <div className="bg-yellow-500 text-white px-6 py-4 flex justify-between items-center">
                <h5 className="font-bold text-lg m-0"><i className="fas fa-edit mr-2"></i> Chỉnh sửa hóa đơn #{editData.id}</h5>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên khách hàng</label>
                  <input type="text" name="customerName" value={editData.customerName} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                  <input type="text" name="customerPhone" value={editData.customerPhone} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ giao hàng</label>
                  <textarea name="address" value={editData.address} onChange={handleEditChange} required rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tổng tiền hóa đơn (₫)</label>
                  <input type="number" step="any" name="totalAmount" value={editData.totalAmount} onChange={handleEditChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái</label>
                  <select name="status" value={editData.status} onChange={handleEditChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white">
                    <option value="ĐÃ THANH TOÁN">ĐÃ THANH TOÁN</option>
                    <option value="HOÀN THÀNH">HOÀN THÀNH</option>
                    <option value="CHỜ XÁC NHẬN">CHỜ XÁC NHẬN (Đẩy ngược lại kho Đơn hàng)</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold transition-colors">Đóng</button>
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold flex items-center transition-colors">
                  <i className="fas fa-save mr-2"></i> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}