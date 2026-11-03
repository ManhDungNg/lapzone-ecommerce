import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy các giá trị từ URL, nếu không có thì gán mặc định
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page')) || 0;
  
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // State cho bộ lọc
  const maxLimit = 200000000;
  const priceGap = 1000000;
  
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : maxLimit,
    cpu: searchParams.get('cpu') || '',
    gpu: searchParams.get('gpu') || '',
    ram: searchParams.get('ram') || '',
    storage: searchParams.get('storage') || '',
    screen: searchParams.get('screen') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  // Mảng danh mục tạm
  const categories = [
    { id: 1, name: 'Acer' },
    { id: 4, name: 'Asus' },
    { id: 5, name: 'Dell' },
    { id: 6, name: 'HP' },
    { id: 7, name: 'Lenovo' },
    { id: 8, name: 'Apple' },
  ];

useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const paramsObj = Object.fromEntries([...searchParams]);
        const res = await api.get('/products/search', { params: paramsObj });
        let rawData = res.data;
        let productArray = [];
        
        if (Array.isArray(rawData)) {
            productArray = rawData;
        } else if (rawData?.products && Array.isArray(rawData.products)) { 
            productArray = rawData.products;
        } else if (rawData?.content && Array.isArray(rawData.content)) {
            productArray = rawData.content;
        }

        setProducts(productArray);
        setTotalPages(rawData?.totalPages || 1);
        
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        setProducts([]); 
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Xử lý thay đổi các input cơ bản
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Xử lý riêng cho thanh trượt giá
  const handlePriceChange = (e) => {
    let { name, value } = e.target;
    value = Number(value);
    if (name === 'minPrice') {
      if (filters.maxPrice - value < priceGap) {
        setFilters({ ...filters, minPrice: filters.maxPrice - priceGap });
      } else {
        setFilters({ ...filters, minPrice: value });
      }
    } else {
      if (value - filters.minPrice < priceGap) {
        setFilters({ ...filters, maxPrice: filters.minPrice + priceGap });
      } else {
        setFilters({ ...filters, maxPrice: value });
      }
    }
  };

  // Áp dụng bộ lọc (Đẩy lên URL)
  const applyFilters = (e) => {
    if (e) e.preventDefault();
    
    const params = {};
    if (query) params.query = query;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.minPrice > 0) params.minPrice = filters.minPrice;
    if (filters.maxPrice < maxLimit) params.maxPrice = filters.maxPrice;
    if (filters.cpu) params.cpu = filters.cpu;
    if (filters.gpu) params.gpu = filters.gpu;
    if (filters.ram) params.ram = filters.ram;
    if (filters.storage) params.storage = filters.storage;
    if (filters.screen) params.screen = filters.screen;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    
    params.page = 0; 
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setFilters({ ...filters, sort: newSort });
    
    const currentParams = Object.fromEntries([...searchParams]);
    currentParams.sort = newSort;
    currentParams.page = 0;
    setSearchParams(currentParams);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const rangeLeft = (filters.minPrice / maxLimit) * 100 + '%';
  const rangeWidth = ((filters.maxPrice - filters.minPrice) / maxLimit) * 100 + '%';

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-blue-600"><i className="fas fa-home"></i> Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800">{query ? `Tìm kiếm: ${query}` : 'Tất cả sản phẩm'}</span>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 border-b-4 border-blue-600 inline-block pb-2">
            Kết Quả Tìm Kiếm {query && `- ${query}`}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ================= SIDEBAR BỘ LỌC ================= */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-blue-600 font-bold text-lg mb-6 flex items-center">
                <i className="fa fa-filter mr-2"></i> Lọc Sản Phẩm
              </h3>
              
              <form onSubmit={applyFilters} className="space-y-5 text-sm">
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Hãng sản xuất:</label>
                  <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Tất cả các hãng --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Mức giá (VNĐ):</label>
                  <div className="relative h-2 bg-gray-200 rounded-full mt-4 mb-8">
                    <div className="absolute h-full bg-blue-500 rounded-full" style={{ left: rangeLeft, width: rangeWidth }}></div>
                    <input 
                      type="range" name="minPrice" min="0" max={maxLimit} step="500000" 
                      value={filters.minPrice} onChange={handlePriceChange}
                      className="absolute w-full -top-1 appearance-none bg-transparent pointer-events-none custom-range-slider"
                    />
                    <input 
                      type="range" name="maxPrice" min="0" max={maxLimit} step="500000" 
                      value={filters.maxPrice} onChange={handlePriceChange}
                      className="absolute w-full -top-1 appearance-none bg-transparent pointer-events-none custom-range-slider"
                    />
                    <div className="absolute top-4 w-full flex justify-between text-xs font-semibold text-gray-500">
                      <span>{formatPrice(filters.minPrice)}</span>
                      <span>{formatPrice(filters.maxPrice)}</span>
                    </div>
                  </div>
                </div>

                {['cpu', 'gpu', 'ram', 'storage', 'screen'].map((field) => (
                  <div key={field}>
                    <label className="block font-semibold text-gray-700 mb-2">
                      {field === 'cpu' ? 'Vi xử lý (CPU):' : field === 'gpu' ? 'Card đồ họa (GPU):' : field === 'ram' ? 'Dung lượng RAM:' : field === 'storage' ? 'Ổ cứng (Storage):' : 'Kích thước màn hình:'}
                    </label>
                    <select name={field} value={filters[field]} onChange={handleFilterChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">-- Tất cả --</option>
                      {field === 'cpu' && <><option value="Core i5">Intel Core i5</option><option value="Core i7">Intel Core i7</option><option value="Ryzen 5">AMD Ryzen 5</option><option value="Apple M">Apple M-Series</option></>}
                      {field === 'gpu' && <><option value="RTX 3050">NVIDIA RTX 3050</option><option value="RTX 4060">NVIDIA RTX 4060</option><option value="Intel Iris">Card Onboard Intel</option></>}
                      {field === 'ram' && <><option value="8GB">8 GB</option><option value="16GB">16 GB</option><option value="32GB">32 GB</option></>}
                      {field === 'storage' && <><option value="256GB">256 GB</option><option value="512GB">512 GB</option><option value="1TB">1 TB</option></>}
                      {field === 'screen' && <><option value="13">Khoảng 13 inch</option><option value="14">Khoảng 14 inch</option><option value="15.6">Khoảng 15.6 inch</option></>}
                    </select>
                  </div>
                ))}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-md">
                  Áp dụng bộ lọc
                </button>
              </form>
            </div>
          </aside>

          {/* ================= MAIN RESULTS ================= */}
          <div className="w-full lg:w-3/4">
            
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="font-semibold text-gray-700">Tìm thấy <span className="text-blue-600">{products.length}</span> sản phẩm</span>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">Sắp xếp theo:</label>
                <select value={filters.sort} onChange={handleSortChange} className="p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="newest">Sản phẩm mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>
            ) : products.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-gray-100 shadow-sm">
                <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl text-gray-500 font-semibold">Không tìm thấy sản phẩm nào phù hợp.</p>
              </div>
            ) : (
              <>
                {/* Lưới sản phẩm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(p => (
                    <article key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden group flex flex-col">
                      <Link to={`/product_detail/${p.id}`} className="flex flex-col h-full p-5">
                        <div className="h-48 flex items-center justify-center mb-4 relative">
                          <img 
                            src={p.image?.startsWith('assets/') ? `/${p.image}` : `/assets/${p.image}`} 
                            alt={p.name}
                            className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600">{p.name}</h3>
                        <div className="text-xl font-bold text-red-600 mt-auto">{formatPrice(p.price)}</div>
                        
                        {p.productDetail && (
                          <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded truncate border border-gray-100">
                            CPU: {p.productDetail.cpu} / RAM: {p.productDetail.ram}
                          </div>
                        )}
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {page > 0 && (
                      <button onClick={() => setSearchParams({ ...Object.fromEntries([...searchParams]), page: page - 1 })} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 font-semibold text-gray-600 transition-colors">
                        <i className="fas fa-chevron-left mr-1"></i> Trước
                      </button>
                    )}
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSearchParams({ ...Object.fromEntries([...searchParams]), page: i })}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${i === page ? 'bg-blue-600 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    {page < totalPages - 1 && (
                      <button onClick={() => setSearchParams({ ...Object.fromEntries([...searchParams]), page: page + 1 })} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 font-semibold text-gray-600 transition-colors">
                        Sau <i className="fas fa-chevron-right ml-1"></i>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-range-slider::-webkit-slider-thumb {
          pointer-events: auto; appearance: none; width: 16px; height: 16px; background: #2563eb; border-radius: 50%; cursor: pointer; box-shadow: 0 0 4px rgba(0,0,0,0.3);
        }
        .custom-range-slider::-moz-range-thumb {
          pointer-events: auto; width: 16px; height: 16px; background: #2563eb; border-radius: 50%; cursor: pointer; border: none; box-shadow: 0 0 4px rgba(0,0,0,0.3);
        }
      `}} />
    </div>
  );
}