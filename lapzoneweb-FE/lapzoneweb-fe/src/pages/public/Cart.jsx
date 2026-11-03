import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Gọi API lấy dữ liệu giỏ hàng[cite: 6]
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        // Giả sử backend trả về mảng trực tiếp hoặc nằm trong res.data.cartItems
        const items = res.data.cartItems || res.data || [];
        setCartItems(items);
        
        // Mặc định chọn tất cả sản phẩm khi mới vào
        setSelectedItems(items.map(item => item.id));
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert('Vui lòng đăng nhập để xem giỏ hàng!');
          navigate('/dangnhap');
        } else {
          console.error("Lỗi tải giỏ hàng:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  // Format tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Cập nhật số lượng[cite: 6]
  const handleUpdateQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    setIsUpdating(true);
    try {
      await api.put(`/cart/${cartItemId}`, { quantity: newQty });
      
      // Cập nhật state nội bộ để giao diện phản hồi ngay lập tức
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQty } : item
      ));
    } catch (error) {
      alert('Không thể cập nhật số lượng. Vui lòng thử lại!');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xóa sản phẩm khỏi giỏ[cite: 6]
  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ?')) return;
    setIsUpdating(true);
    try {
      await api.delete(`/cart/${cartItemId}`);
      
      // Loại bỏ khỏi danh sách hiển thị và danh sách đang chọn
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      setSelectedItems(prev => prev.filter(id => id !== cartItemId));
      
      // Có thể trigger event để Header cập nhật lại số lượng badge
      window.dispatchEvent(new Event('cartUpdated')); 
    } catch (error) {
      alert('Xóa sản phẩm thất bại!');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xử lý Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (cartItemId) => {
    setSelectedItems(prev => 
      prev.includes(cartItemId) 
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  // Tính tổng tiền dựa trên các item được tick chọn
  const totalAmount = cartItems
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Xác nhận thanh toán
  const handleCheckout = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Trưởng nhóm ơi! Vui lòng tích chọn ít nhất 1 sản phẩm để thanh toán nhé!');
      return;
    }
    
    // Chuyển hướng sang trang thanh toán kèm theo danh sách ID sản phẩm đã chọn
    // (Có thể dùng state của react-router để truyền data)
    navigate('/checkout', { state: { selectedItems } });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="bg-gray-50 p-6 flex items-center gap-4 border-b border-gray-200">
            <i className="fas fa-shopping-cart text-3xl text-blue-600"></i>
            <h2 className="text-2xl font-bold text-gray-800 m-0">Giỏ hàng của bạn</h2>
          </div>
          
          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-20 px-4">
              <i className="fas fa-box-open text-7xl text-gray-300 mb-6 block"></i>
              <p className="text-lg text-gray-500 mb-8 font-medium">Giỏ hàng của bạn đang trống. Hãy chọn cho mình một chiếc Laptop ưng ý nhé!</p>
              <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
                <i className="fas fa-arrow-left mr-2"></i> Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            /* Cart Table */
            <form onSubmit={handleCheckout}>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead className="bg-gray-50 text-gray-500 font-semibold text-sm border-b border-gray-200">
                    <tr>
                      <th className="py-4 pl-6 w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                          onChange={handleSelectAll}
                          className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
                        />
                      </th>
                      <th className="py-4 text-left px-4">Sản phẩm</th>
                      <th className="py-4 px-4 w-32">Đơn giá</th>
                      <th className="py-4 px-4 w-40">Số lượng</th>
                      <th className="py-4 px-4 w-40">Thành tiền</th>
                      <th className="py-4 pr-6 w-20">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cartItems.map(item => (
                      <tr key={item.id} className={`transition-colors ${selectedItems.includes(item.id) ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                        <td className="py-6 pl-6">
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
                          />
                        </td>
                        <td className="py-6 px-4">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-20 h-20 bg-white border border-gray-100 p-2 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <img 
                                src={item.product.image?.startsWith('assets/') ? `/${item.product.image}` : `/assets/${item.product.image}`} 
                                alt={item.product.name}
                                className="max-h-full object-contain"
                              />
                            </div>
                            <div>
                              <Link to={`/product_detail/${item.product.id}`} className="font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                {item.product.name}
                              </Link>
                              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {item.product.category?.name || 'Laptop'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4 font-bold text-gray-700">
                          {formatPrice(item.product.price)}
                        </td>
                        <td className="py-6 px-4">
                          <div className="flex items-center justify-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit mx-auto shadow-sm">
                            <button 
                              type="button" 
                              onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 rounded disabled:opacity-50 transition-colors"
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              readOnly
                              className="w-10 text-center font-bold text-gray-800 focus:outline-none"
                            />
                            <button 
                              type="button" 
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                              disabled={isUpdating || item.quantity >= item.product.stock}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 text-gray-600 rounded disabled:opacity-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-6 px-4 font-bold text-red-600 text-lg">
                          {formatPrice(item.product.price * item.quantity)}
                        </td>
                        <td className="py-6 pr-6 text-center">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all mx-auto disabled:opacity-50"
                            title="Xóa khỏi giỏ hàng"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-200">
                <Link to="/" className="text-gray-500 font-semibold hover:text-blue-600 transition-colors">
                  <i className="fas fa-arrow-left mr-2"></i> Mua thêm máy khác
                </Link>
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                  <div className="text-lg text-gray-700 font-medium">
                    Tổng thanh toán: 
                    <span className="text-3xl font-extrabold text-red-600 ml-4">{formatPrice(totalAmount)}</span>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Tiến hành đặt hàng <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </main>
      
      <Footer />
    </div>
  );
}