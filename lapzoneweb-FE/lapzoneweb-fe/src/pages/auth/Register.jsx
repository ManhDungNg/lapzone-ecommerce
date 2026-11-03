import { useState, useEffect } from "react";
import api from "../../services/api";

export default function Register() {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const laptops = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop", // Màn hình code tối
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=2000&auto=format&fit=crop", // Setup phím cơ tối màu
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop"  // Đồ họa ma trận/code tối
  ];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex === laptops.length - 1 ? 0 : prevIndex + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/auth/register', formData);
      setMessage("Đăng ký thành công! Hãy chuyển tới trang đăng nhập.");
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(JSON.stringify(error.response.data));
      } else {
        setMessage('Không thể kết nối đến máy chủ');
      }
    }
  };

  return (
    <div className="min-h-screen flex relative">
      
      {/* Nửa bên trái: Slideshow ảnh Dark Theme */}
      <div 
        className="absolute inset-0 z-0 lg:relative lg:flex lg:w-1/2 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url('${laptops[bgIndex]}')` }}
      >
        {/* Tăng độ tối lên bg-black/90 để chìm hẳn ảnh, tập trung vào chữ và form */}
        <div className="w-full h-full flex items-center justify-center bg-black/90 transition-opacity duration-500">
          <div className="hidden lg:block text-white text-center px-12">
            <h1 className="text-5xl font-bold mb-4 tracking-wider">LAPZONE</h1>
            <p className="text-lg font-light text-gray-400">
              Định hình phong cách công nghệ. Tối giản, mạnh mẽ và đẳng cấp.
            </p>
          </div>
        </div>
      </div>

      {/* Nửa bên phải: Form đăng ký */}
      <div className="z-10 w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-12 lg:bg-gray-50">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm lg:bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Tạo tài khoản</h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm text-center font-medium ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
              <input 
                type="text" name="fullName" value={formData.fullName} onChange={handleChange} 
                placeholder="Nguyễn Văn A" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input 
                type="email" name="email" value={formData.email} onChange={handleChange} 
                placeholder="email@example.com" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                  placeholder="09xx..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thành phố</label>
                <input 
                  type="text" name="address" value={formData.address} onChange={handleChange} 
                  placeholder="Hà Nội, HCM..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
              <input 
                type="password" name="password" value={formData.password} onChange={handleChange} 
                placeholder="••••••••" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input 
                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} 
                placeholder="••••••••" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-4 shadow-lg"
            >
              Đăng ký ngay
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản? <a href="/login" className="text-gray-900 hover:underline font-bold">Đăng nhập tại đây</a>
          </p>
        </div>
      </div>
    </div>
  );
}