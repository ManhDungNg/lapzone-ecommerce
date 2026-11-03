import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Lấy danh sách người dùng khi vào trang
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!');
        navigate('/dangnhap');
      } else {
        setMessage({ type: 'error', text: 'Không thể tải danh sách người dùng.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);


  const handleUpdateRole = async (userId, newRole, e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      // Đã sửa: Ghép ID trực tiếp vào URL và truyền role dưới dạng query parameter để khớp 100% với Backend
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      
      setMessage({ type: 'success', text: `Cập nhật quyền cho người dùng #${userId} thành công!` });
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Cập nhật quyền thất bại. Vui lòng thử lại.' });
    }
  };
  // Xử lý Xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác!')) return;
    
    setMessage({ type: '', text: '' });
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage({ type: 'success', text: 'Đã xóa người dùng thành công!' });
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xóa người dùng này.' });
    }
  };

  if (loading && users.length === 0) return <div className="flex h-screen items-center justify-center bg-gray-100"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
     <AdminSidebar />

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <main className="ml-64 p-10 w-[calc(100%-256px)]">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="bg-white py-5 px-6 border-b border-gray-100 flex items-center">
            <h5 className="m-0 font-bold text-gray-800 text-lg flex items-center">
              <i className="fas fa-users-cog text-blue-600 mr-2 text-xl"></i> QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
            </h5>
          </div>

          <div className="p-6">
            {/* Thông báo Alert */}
            {message.text && (
              <div className={`px-4 py-3 rounded-xl mb-6 font-bold flex items-center justify-between ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                <div>
                  <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  {message.text}
                </div>
                <button onClick={() => setMessage({type:'', text:''})} className="text-lg leading-none hover:opacity-70">&times;</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-sm">
                  <tr>
                    <th className="py-3 px-4 w-20">ID</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Số điện thoại</th>
                    <th className="py-3 px-4 w-64">Quyền hạn</th>
                    <th className="py-3 px-4 text-center w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-gray-500">Chưa có người dùng nào trong hệ thống.</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-bold text-gray-500">#{u.id}</td>
                        <td className="py-4 px-4 font-semibold text-gray-800">{u.fullName}</td>
                        <td className="py-4 px-4 text-gray-600">{u.email}</td>
                        <td className="py-4 px-4 text-gray-600">{u.phone || 'N/A'}</td>
                        <td className="py-4 px-4">
                          <form onSubmit={(e) => handleUpdateRole(u.id, e.target.role.value, e)} className="flex items-center gap-2">
                            <select 
                              name="role" 
                              defaultValue={u.role}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none w-36 shadow-sm"
                            >
                              <option value="USER">Khách hàng</option>
                              <option value="ADMIN">Quản trị (Admin)</option>
                            </select>
                            <button type="submit" className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center">
                              <i className="fas fa-save mr-1"></i> Lưu
                            </button>
                          </form>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button 
                            type="button" 
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors inline-flex items-center"
                          >
                            <i className="fas fa-trash-alt mr-1"></i> Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}