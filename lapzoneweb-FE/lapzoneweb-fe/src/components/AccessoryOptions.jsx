import React, { useState, useEffect } from 'react';

export default function AccessoryOptions() {
  const accessoryIds = [
    { id: "earphone", label: "Tai nghe Gaming" },
    { id: "keyboard", label: "Bàn phím cơ" },
    { id: "mouse", label: "Chuột không dây" },
    { id: "RAM", label: "Nâng cấp RAM" },
    { id: "monitor", label: "Màn hình rời" }
  ];
  
  const [accessories, setAccessories] = useState(() => {
    const saved = {};
    accessoryIds.forEach(acc => {
      saved[acc.id] = localStorage.getItem(acc.id) === 'true';
    });
    return saved;
  });

  useEffect(() => {
    Object.keys(accessories).forEach(id => {
      localStorage.setItem(id, accessories[id]);
    });
  }, [accessories]);

  const handleCheckboxChange = (id) => {
    setAccessories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 mt-4">
      <h4 className="font-bold text-gray-800 mb-3"><i className="fas fa-headphones mr-2 text-blue-600"></i>Mua kèm phụ kiện</h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {accessoryIds.map(acc => (
          <label key={acc.id} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
            <input 
              type="checkbox" 
              checked={accessories[acc.id]} 
              onChange={() => handleCheckboxChange(acc.id)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="font-medium">{acc.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}