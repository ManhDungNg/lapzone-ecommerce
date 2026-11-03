import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError('Không tìm thấy thông tin đơn hàng hoặc bạn không có quyền xem.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-xl">{error}</div>;
  if (!order) return null;

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 print:bg-white">
      {/* Ẩn Header khi in */}
      <div className="print:hidden">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-10 print:py-0 print:px-0">
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-gray-100 print:shadow-none print:border-none print:p-2 print:m-0">
          
          {/* TOP: Thông tin công ty & Mã đơn */}
          <div className="flex flex-col md:flex-row justify-between pb-6 border-b-2 border-gray-100 print:border-gray-300">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">LAPZONE</h1>
              <div className="font-bold text-gray-800 mt-1">CÔNG TY TNHH CÔNG NGHỆ LAPZONE</div>
              <div className="text-sm text-gray-500 mt-1">📍 Số 3 Ngõ 117 Thái Hà, Đống Đa, HN</div>
              <div className="text-sm text-gray-500 mt-1">📞 Bán hàng: 093.669.3388 - 🌐 www.lapzone.vn</div>
            </div>
            
            <div className="text-left md:text-right">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Hóa Đơn Bán Lẻ</h2>
              <div className="mt-2 text-gray-700">Mã đơn hàng: <strong className="text-gray-900">#{order.id}</strong></div>
              <div className="mt-1 text-gray-700">Ngày lập: {formatDate(order.orderDate)}</div>
              <div className="mt-1 text-gray-700">Trạng thái: <strong className="text-red-600">{order.status || 'Chờ xử lý'}</strong></div>
            </div>
          </div>

          {/* MIDDLE: Thông tin Khách hàng & Thanh toán */}
          <div className="flex flex-col md:flex-row justify-between py-6 border-b border-gray-100 print:border-gray-300">
            <div>
              <strong className="text-gray-900 block mb-1">Thông tin khách hàng:</strong>
              <div className="text-gray-700">{order.customerName}</div>
              <div className="text-gray-700">SĐT: {order.customerPhone}</div>
              <div className="text-gray-700">ĐC: {order.address}</div>
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0">
              <strong className="text-gray-900 block mb-1">Phương thức thanh toán:</strong>
              <div className="text-gray-700">{order.paymentMethod}</div>
            </div>
          </div>

          {/* TABLE: Danh sách sản phẩm */}
          <div className="mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-100">
                  <th className="py-3 px-4 font-bold text-gray-700 border-b-2 border-gray-200">Sản phẩm</th>
                  <th className="py-3 px-4 font-bold text-gray-700 border-b-2 border-gray-200 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                {order.orderDetails?.map((detail, index) => (
                  <tr key={index}>
                    <td className="py-4 px-4">
                      <strong className="text-gray-800 block">{detail.product?.name || 'Sản phẩm'}</strong>
                      <span className="text-sm text-gray-500">Đơn giá: {formatPrice(detail.price)} x {detail.quantity}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-800">
                      {formatPrice(detail.price * detail.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTTOM: Tổng tiền & Chính sách */}
          <div className="flex flex-col md:flex-row justify-between items-end mt-6 pt-6 border-t-2 border-gray-100 print:border-gray-300">
            <div className="w-full md:w-1/2 mb-6 md:mb-0">
              <strong className="text-gray-900 block mb-2">CHÍNH SÁCH BẢO HÀNH</strong>
              <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                <li>Đổi mới trong 30 ngày nếu có lỗi từ NSX.</li>
                <li>Bảo hành phần cứng 24 tháng chính hãng.</li>
              </ul>
            </div>
            
            <div className="w-full md:w-1/2 text-left md:text-right">
              <span className="text-lg font-bold text-gray-800 mr-4">TỔNG CỘNG:</span>
              <span className="text-3xl font-extrabold text-red-600 tracking-tight">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="flex justify-between text-center mt-12 pt-8">
            <div className="w-1/2">
              <strong className="text-gray-900 block">Khách hàng</strong>
              <em className="text-sm text-gray-500 block mb-24">(Ký, ghi rõ họ tên)</em>
            </div>
            <div className="w-1/2">
              <strong className="text-gray-900 block">Người bán hàng</strong>
              <em className="text-sm text-gray-500 block mb-24">(Ký, đóng dấu)</em>
              <strong className="text-gray-800 uppercase">{localStorage.getItem('userName') || 'NHÂN VIÊN BÁN HÀNG'}</strong>
            </div>
          </div>

        </div>

        {/* Nút thao tác (Sẽ bị ẩn khi in) */}
        <div className="text-center mt-8 print:hidden flex justify-center gap-4">
          <button 
            onClick={handlePrint} 
            className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-xl transition-colors shadow-sm flex items-center"
          >
            <i className="fas fa-print mr-2"></i> In hóa đơn
          </button>
          <Link 
            to="/" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md flex items-center"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>

      {/* Ẩn Footer khi in */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}