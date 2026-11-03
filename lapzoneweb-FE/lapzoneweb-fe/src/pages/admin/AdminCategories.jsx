import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

export default function AdminCategories() {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State cho Modal (Popup) Thêm/Sửa Danh mục
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '' });
  const isEditing = Boolean(formData.id);

  // Hàm load danh sách danh mục (GET /api/admin/categories)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!');
        navigate('/dangnhap');
      } else {
        setMessage({ type: 'error', text: 'Không thể tải danh sách danh mục.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [navigate]);

  // Xử lý mở Modal
  const openModalForAdd = () => {
    setFormData({ id: '', name: '' });
    setShowModal(true);
  };

  const openModalForEdit = (cat) => {
    setFormData({ id: cat.id, name: cat.name });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý Thêm / Cập nhật Danh mục (POST /api/admin/categories hoặc PUT /api/admin/categories/{id})
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    try {
      if (isEditing) {
        // Cập nhật
        await api.put(`/admin/categories/${formData.id}`, { name: formData.name });
        setMessage({ type: 'success', text: `Cập nhật danh mục "${formData.name}" thành công!` });
      } else {
        // Thêm mới
        await api.post('/admin/categories', { name: formData.name });
        setMessage({ type: 'success', text: `Thêm danh mục "${formData.name}" thành công!` });
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.' });
    }
  };

  // Xử lý Xóa Danh mục (DELETE /api/admin/categories/{id})
  const handleDelete = async (catId, catName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hãng "${catName}" không? (Thao tác này có thể ảnh hưởng đến các sản phẩm thuộc hãng này)`)) return;
    
    try {
      await api.delete(`/admin/categories/${catId}`);
      setMessage({ type: 'success', text: `Đã xóa danh mục "${catName}" thành công!` });
      fetchCategories();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xóa danh mục này. Rất có thể đang có sản phẩm thuộc hãng này.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* ================= SIDEBAR DÙNG CHUNG ================= */}
      <AdminSidebar />

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <main className="ml-64 p-10 w-[calc(100%-256px)] relative">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header Bảng */}
          <div className="bg-white py-5 px-6 border-b border-gray-100 flex items-center justify-between">
            <h5 className="m-0 font-bold text-blue-600 text-lg flex items-center">
              <i className="fas fa-tags mr-2 text-xl"></i> QUẢN LÝ DANH MỤC (HÃNG LAPTOP)
            </h5>
            <button 
              onClick={openModalForAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Thêm Danh Mục Mới
            </button>
          </div>

          <div className="p-6">
            
            {/* Thông báo */}
            {message.text && (
              <div className={`px-4 py-3 rounded-xl mb-6 font-bold flex items-center justify-between ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                <div>
                  <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  {message.text}
                </div>
                <button onClick={() => setMessage({type:'', text:''})} className="text-xl leading-none hover:opacity-70">&times;</button>
              </div>
            )}

            {/* Bảng dữ liệu */}
            {loading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-200">
                  <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                    <tr>
                      <th className="py-3 px-6 border border-gray-200 w-24 text-center">ID</th>
                      <th className="py-3 px-6 border border-gray-200">Tên Danh Mục (Hãng)</th>
                      <th className="py-3 px-6 border border-gray-200 w-40 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.length === 0 ? (
                      <tr><td colSpan="3" className="py-8 text-center text-gray-500">Chưa có danh mục nào.</td></tr>
                    ) : (
                      categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-800 text-center border border-gray-200">#{cat.id}</td>
                          <td className="py-4 px-6 font-semibold text-gray-900 border border-gray-200 text-lg">{cat.name}</td>
                          <td className="py-4 px-6 text-center border border-gray-200">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => openModalForEdit(cat)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors border border-yellow-200 hover:border-yellow-500" 
                                title="Sửa thông tin"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors border border-red-200 hover:border-red-600" 
                                title="Xóa danh mục"
                              >
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

      {/* ================= MODAL THÊM/SỬA DANH MỤC ================= */}
      {showModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <form onSubmit={handleSubmit}>
              
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h5 className="font-bold text-lg m-0">
                  <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-2`}></i> 
                  {isEditing ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới'}
                </h5>
                <button type="button" onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
              </div>
              
              <div className="p-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên Danh Mục (Hãng)</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="VD: Dell, Asus, Apple..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium" 
                />
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors">
                  Đóng
                </button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold flex items-center transition-colors shadow-md">
                  <i className="fas fa-save mr-2"></i> Lưu lại
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

    </div>
  );
}