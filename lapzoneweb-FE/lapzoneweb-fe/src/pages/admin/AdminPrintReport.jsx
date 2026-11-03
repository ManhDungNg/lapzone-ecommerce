import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function AdminPrintReport() {
  const [searchParams] = useSearchParams();
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const userName = localStorage.getItem('userName') || 'QUẢN TRỊ VIÊN';

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    startDateStr: startDate,
    endDateStr: endDate,
    totalOrders: 0,
    totalRevenue: 0,
    brandRevenue: {}, // Dạng Map: { 'Dell': 150000000, 'Asus': 100000000 }
    brandQuantity: {}, // Dạng Map: { 'Dell': 10, 'Asus': 5 }
    invoices: []
  });

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy dữ liệu báo cáo (Thay đổi endpoint cho khớp với Backend của bạn)
        const res = await api.get('/admin/report/revenue', {
          params: { startDate, endDate }
        });
        
        // Merge dữ liệu an toàn
        setReportData(prev => ({ ...prev, ...res.data }));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [startDate, endDate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Lấy danh sách tên Hãng từ keys của object brandRevenue
  const brandList = Object.keys(reportData.brandRevenue || {});

  // Xử lý ngày tháng năm hiện tại cho phần Chữ ký
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 print:hidden"><div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="bg-gray-100 min-h-screen py-10 print:bg-white print:py-0 font-[Times_New_Roman]">
      
      {/* Nút In báo cáo (Sẽ bị ẩn khi in ra giấy) */}
      <button 
        onClick={() => window.print()} 
        className="block mx-auto mb-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors print:hidden"
      >
        <i className="fas fa-print mr-2"></i> 🖨️ IN BÁO CÁO
      </button>

      {/* Khung báo cáo chính (A4) */}
      <div className="max-w-[900px] mx-auto bg-white p-10 shadow-lg border border-gray-200 print:shadow-none print:border-none print:max-w-full print:p-0">
        
        {/* Header Hành chính */}
        <div className="flex justify-between items-start text-center mb-8">
          <div className="w-5/12 text-[13pt]">
            <div className="font-bold uppercase">CÔNG TY TNHH CÔNG NGHỆ LAPZONE</div>
            <div>Số 3 Ngõ 117 Thái Hà, Đống Đa, HN</div>
            <div>Hotline: 093.669.3388</div>
          </div>
          <div className="w-7/12">
            <div className="font-bold text-[13pt] uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div className="font-bold text-[14pt] underline mt-1 inline-block">Độc lập - Tự do - Hạnh phúc</div>
          </div>
        </div>

        {/* Tiêu đề báo cáo */}
        <div className="text-center my-10">
          <h2 className="text-[20pt] font-bold m-0 uppercase">BÁO CÁO DOANH THU KINH DOANH</h2>
          <p className="italic mt-2 text-[14pt]">
            (Kỳ báo cáo: Từ ngày <span className="font-semibold">{reportData.startDateStr || '...'}</span> đến ngày <span className="font-semibold">{reportData.endDateStr || '...'}</span>)
          </p>
        </div>

        {/* Bảng 1: Thống kê chung */}
        <div className="font-bold text-[14pt] mt-8 mb-3 uppercase">I. KẾT QUẢ KINH DOANH TỔNG HỢP</div>
        <table className="w-full border-collapse mb-6 text-[14pt]">
          <thead>
            <tr>
              <th className="border border-black bg-gray-100 p-2 w-1/2 text-center">Chỉ tiêu</th>
              <th className="border border-black bg-gray-100 p-2 w-1/2 text-center">Kết quả</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">1. Tổng số đơn hàng thành công</td>
              <td className="border border-black p-2 text-center font-bold">{reportData.totalOrders} đơn</td>
            </tr>
            <tr>
              <td className="border border-black p-2">2. Tổng doanh thu thực tế</td>
              <td className="border border-black p-2 text-center font-bold text-red-600 print:text-black">
                {formatPrice(reportData.totalRevenue)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bảng 2: Thống kê theo hãng */}
        <div className="font-bold text-[14pt] mt-8 mb-3 uppercase">II. DOANH THU THEO HÃNG SẢN XUẤT</div>
        <table className="w-full border-collapse mb-6 text-[14pt]">
          <thead>
            <tr>
              <th className="border border-black bg-gray-100 p-2 w-[10%] text-center">STT</th>
              <th className="border border-black bg-gray-100 p-2 w-[40%] text-center">Hãng Sản Xuất</th>
              <th className="border border-black bg-gray-100 p-2 w-[20%] text-center">SL Máy Bán</th>
              <th className="border border-black bg-gray-100 p-2 w-[30%] text-center">Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {brandList.length === 0 ? (
              <tr><td colSpan="4" className="border border-black p-2 text-center">Không có dữ liệu trong kỳ này</td></tr>
            ) : (
              brandList.map((brand, index) => (
                <tr key={brand}>
                  <td className="border border-black p-2 text-center">{index + 1}</td>
                  <td className="border border-black p-2">{brand}</td>
                  <td className="border border-black p-2 text-center">{reportData.brandQuantity[brand] || 0}</td>
                  <td className="border border-black p-2 text-right">{formatPrice(reportData.brandRevenue[brand])}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Bảng 3: Chi tiết đơn hàng */}
        <div className="font-bold text-[14pt] mt-8 mb-3 uppercase">III. CHI TIẾT CÁC ĐƠN HÀNG THÀNH CÔNG</div>
        <table className="w-full border-collapse mb-6 text-[12pt]">
          <thead>
            <tr>
              <th className="border border-black bg-gray-100 p-2 text-center">Mã ĐH</th>
              <th className="border border-black bg-gray-100 p-2 text-center">Ngày Bán</th>
              <th className="border border-black bg-gray-100 p-2 text-center">Tên Khách Hàng</th>
              <th className="border border-black bg-gray-100 p-2 text-center">Số Điện Thoại</th>
              <th className="border border-black bg-gray-100 p-2 text-center w-[30%]">Sản Phẩm Đã Mua</th>
              <th className="border border-black bg-gray-100 p-2 text-center">Tổng Tiền</th>
            </tr>
          </thead>
          <tbody>
            {!reportData.invoices || reportData.invoices.length === 0 ? (
              <tr><td colSpan="6" className="border border-black p-2 text-center">Không có đơn hàng nào trong kỳ này</td></tr>
            ) : (
              reportData.invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="border border-black p-2 text-center">#{invoice.id}</td>
                  <td className="border border-black p-2 text-center">{formatDate(invoice.orderDate)}</td>
                  <td className="border border-black p-2">{invoice.customerName}</td>
                  <td className="border border-black p-2 text-center">{invoice.customerPhone}</td>
                  <td className="border border-black p-2">
                    <ul className="list-disc pl-5 m-0 text-[11pt]">
                      {invoice.orderDetails?.map((detail, idx) => (
                        <li key={idx}>{detail.product?.name} (x{detail.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-black p-2 text-right">{formatPrice(invoice.totalAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Chữ ký */}
        <div className="mt-16 break-inside-avoid">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/2"></td>
                <td className="w-1/2 text-center align-top">
                  <div className="italic text-[12pt]">Hà Nội, ngày {day} tháng {month} năm {year}</div>
                  <div className="font-bold text-[14pt] mt-2">Người lập báo cáo</div>
                  <div className="italic text-[12pt]">(Ký, ghi rõ họ tên)</div>
                  
                  <br /><br /><br /><br /><br />
                  
                  <div className="font-bold text-[14pt] uppercase">{userName}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}