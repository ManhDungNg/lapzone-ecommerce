import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

export default function AdminProducts() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Admin';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State quản lý form (dùng chung cho cả Thêm và Sửa)
  const initialFormState = {
    id: '',
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    productDetail: { id: '', cpu: '', ram: '', gpu: '', screen: '', moreInfo: '' }
  };
  const [formData, setFormData] = useState(initialFormState);
  
  // State quản lý File Upload
  const [imageFile, setImageFile] = useState(null);
  const [subImages, setSubImages] = useState([]);

  const isEditing = Boolean(formData.id);

  // Khởi tạo dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách sản phẩm[cite: 2]
      const resProducts = await api.get('/admin/products');
      setProducts(resProducts.data.content || resProducts.data || []);
      
      // 2. Lấy danh sách danh mục (hãng)[cite: 5]
      const resCategories = await api.get('/admin/categories');
      setCategories(resCategories.data || []);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!');
        navigate('/dangnhap');
      } else {
        setMessage({ type: 'error', text: 'Lỗi khi tải dữ liệu từ máy chủ.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // Xử lý thay đổi input thông thường
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('detail_')) {
      const detailField = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        productDetail: { ...prev.productDetail, [detailField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Nạp dữ liệu vào form khi bấm nút "Sửa"
  const handleEditClick = async (productId) => {
    try {
      const res = await api.get(`/admin/products/${productId}`);
      const p = res.data;
      setFormData({
        id: p.id,
        name: p.name || '',
        price: p.price || '',
        stock: p.stock || '',
        categoryId: p.category?.id || '',
        productDetail: {
          id: p.productDetail?.id || '',
          cpu: p.productDetail?.cpu || '',
          ram: p.productDetail?.ram || '',
          gpu: p.productDetail?.gpu || '',
          screen: p.productDetail?.screen || '',
          moreInfo: p.productDetail?.moreInfo || ''
        }
      });
      // Đưa màn hình lên khu vực form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể lấy thông tin chi tiết sản phẩm.' });
    }
  };

  // Reset Form
  const handleCancelEdit = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setSubImages([]);
    // Xóa value của input file (DOM thao tác nhẹ)
    document.getElementById('imageFile').value = '';
    document.getElementById('subImages').value = '';
  };

  // Xử lý Submit Form (Hỗ trợ upload ảnh nhiều file)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Sử dụng FormData chuẩn để gửi dữ liệu dạng key-value
    const submitData = new FormData();
    
    // 1. Nạp các trường cơ bản của Product
    submitData.append('name', formData.name);
    submitData.append('price', formData.price);
    submitData.append('stock', formData.stock);
    
    // 2. Nạp ID danh mục (Hãng)
    if (formData.categoryId) {
        submitData.append('categoryId', formData.categoryId);
    }
    
    // 3. Nạp cấu hình chi tiết (ProductDetail)
    if (formData.productDetail.cpu) submitData.append('productDetail.cpu', formData.productDetail.cpu);
    if (formData.productDetail.ram) submitData.append('productDetail.ram', formData.productDetail.ram);
    if (formData.productDetail.gpu) submitData.append('productDetail.gpu', formData.productDetail.gpu);
    if (formData.productDetail.screen) submitData.append('productDetail.screen', formData.productDetail.screen);
    if (formData.productDetail.moreInfo) submitData.append('productDetail.moreInfo', formData.productDetail.moreInfo);
    
    // 4. Append File chính
    if (imageFile) {
      submitData.append('imageFile', imageFile);
    }
    
    // 5. Append các File phụ (Đã sửa để cho phép upload đa luồng)
    if (subImages && subImages.length > 0) {
      for (let i = 0; i < subImages.length; i++) {
        submitData.append('subImages', subImages[i]);
      }
    }

    try {
      if (isEditing) {
        // Nếu sửa, bạn nhớ truyền thêm formData.id vào URL
        await api.put(`/admin/products/${formData.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage({ type: 'success', text: 'Cập nhật Laptop thành công!' });
      } else {
        await api.post('/admin/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage({ type: 'success', text: 'Thêm Laptop mới thành công!' });
      }
      
      handleCancelEdit();
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra khi lưu sản phẩm.' });
    }
  };

  // Xử lý Xóa sản phẩm[cite: 2]
  const handleDeleteClick = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa máy tính này khỏi kho? Hành động này không thể hoàn tác!')) return;
    
    try {
      await api.delete(`/admin/products/${productId}`);
      setMessage({ type: 'success', text: 'Đã xóa sản phẩm thành công!' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xóa sản phẩm. Có thể sản phẩm này đang nằm trong hóa đơn của khách hàng.' });
    }
  };

 const getImageUrl = (img) => {
    if (!img) return 'http://localhost:8080/assets/no-image.png';
    // Đảm bảo React lấy ảnh trực tiếp từ backend cổng 8080
    return `http://localhost:8080/assets/${img.replace('assets/', '')}`;
  };

  if (loading && products.length === 0) return <div className="flex h-screen items-center justify-center bg-gray-100"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      <AdminSidebar />

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <main className="ml-64 p-8 w-[calc(100%-256px)]">
        
        {/* Top Bar[cite: 20] */}
        <div className="bg-white px-6 py-4 rounded-xl mb-8 flex justify-between items-center shadow-sm">
          <div className="text-gray-800 font-bold text-lg">Quản lý kho Laptop</div>
          <div className="font-semibold text-gray-700">
            <i className="fas fa-user-circle text-blue-600 mr-2 text-xl"></i> Admin: <span className="text-blue-600">{userName}</span>
          </div>
        </div>

        {/* Thông báo Alert[cite: 20] */}
        {message.text && (
          <div className={`px-4 py-3 rounded-lg mb-6 font-bold flex items-center justify-between ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            <div>
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
              {message.text}
            </div>
            <button onClick={() => setMessage({type:'', text:''})} className="text-lg leading-none hover:opacity-70">&times;</button>
          </div>
        )}

        {/* ================= FORM THÊM/SỬA SẢN PHẨM ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h4 className="text-xl font-bold text-gray-800 mb-6">
            {isEditing ? '✏️ Cập Nhật Laptop' : '➕ Thêm Laptop Mới'}
          </h4>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Row 1 */}
              <div className="col-span-12 md:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên máy tính</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="VD: Dell XPS 13..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">Giá bán (VNĐ)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="1" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">Hãng</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">-- Chọn Hãng --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              {/* Row 2: Cấu hình */}
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">CPU</label>
                <input type="text" name="detail_cpu" value={formData.productDetail.cpu} onChange={handleInputChange} placeholder="i5 13th, M3..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">RAM</label>
                <input type="text" name="detail_ram" value={formData.productDetail.ram} onChange={handleInputChange} placeholder="8GB, 16GB..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">GPU (Card đồ họa)</label>
                <input type="text" name="detail_gpu" value={formData.productDetail.gpu} onChange={handleInputChange} placeholder="RTX 4050, Onboard..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm font-bold text-gray-700 mb-1">Màn hình</label>
                <input type="text" name="detail_screen" value={formData.productDetail.screen} onChange={handleInputChange} placeholder="14 inch, 2K..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              {/* Row 3: Phân loại */}
              <div className="col-span-12">
                <label className="block text-sm font-bold text-gray-700 mb-1">Phân loại nhu cầu (Từ khóa tìm kiếm)</label>
                <input type="text" name="detail_moreInfo" value={formData.productDetail.moreInfo} onChange={handleInputChange} placeholder="VD: Gaming, Văn Phòng, Cao Cấp, Đồ Họa (Dùng để phân loại trên trang chủ)" className="w-full px-3 py-2 border border-blue-200 text-blue-600 font-semibold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              {/* Row 4: Ảnh[cite: 20] */}
              <div className="col-span-12 md:col-span-4">
                <label className="block text-sm font-bold text-blue-600 mb-1">1. Ảnh đại diện chính</label>
                <input type="file" id="imageFile" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" />
              </div>
              <div className="col-span-12 md:col-span-8">
                <label className="block text-sm font-bold text-green-600 mb-1">2. Bộ ảnh chi tiết (Chọn nhiều file cùng lúc)</label>
                <input type="file" id="subImages" accept="image/*" multiple onChange={(e) => setSubImages(e.target.files)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50" />
              </div>

              {/* Action Buttons */}
              <div className="col-span-12 mt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCancelEdit} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                  Hủy bỏ / Làm mới
                </button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                  {isEditing ? '✏️ Cập nhật sản phẩm' : '➕ Thêm sản phẩm'}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* ================= BẢNG DANH SÁCH SẢN PHẨM ================= */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            📦 <span className="ml-2">Danh sách kho hàng</span>
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-gray-600">Ảnh</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Tên máy</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Giá</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Hãng</th>
                  <th className="py-3 px-4 font-semibold text-gray-600">Cấu hình</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 w-24 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-500">Chưa có sản phẩm nào trong kho.</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <img src={getImageUrl(p.image)} alt="Laptop" className="w-16 h-12 object-contain bg-white border border-gray-200 rounded p-1" />
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800">{p.name}</td>
                      <td className="py-3 px-4 font-semibold text-red-600">{new Intl.NumberFormat('vi-VN').format(p.price)}đ</td>
                      <td className="py-3 px-4 text-gray-600">{p.category?.name || 'Chưa phân loại'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded w-fit">{p.productDetail?.cpu || 'N/A'}</span>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded w-fit">{p.productDetail?.ram || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEditClick(p.id)} className="w-8 h-8 flex items-center justify-center rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => handleDeleteClick(p.id)} className="w-8 h-8 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

    </div>
  );
}