import React, { useState, useEffect } from 'react';

export default function Countdown({ targetDate = "2026-12-31T23:59:59" }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const endDate = new Date(targetDate).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('Khuyến mãi đã hết hạn');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`Khuyến mãi còn ${days} Ngày ${hours} Giờ ${minutes} Phút ${seconds} Giây`);
    }, 1000);

    // Dọn dẹp interval khi component bị hủy (Chống rò rỉ bộ nhớ)
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg inline-block">
      <i className="fas fa-clock mr-2"></i> {timeLeft}
    </div>
  );
}