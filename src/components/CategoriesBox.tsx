'use client';

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/app/admin/api';

type Category = {
  id: string;
  name: string;
  icon?: string;
  icon_url?: string;
};

interface CategoriesBoxProps {
  onCategoryClick?: (categoryName: string) => void;
}

export default function CategoriesBox({ onCategoryClick }: CategoriesBoxProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiGet<Category[]>('/categories', '');
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const isImageUrl = (url?: string | null) => {
    if (!url) return false;
    try {
      const lower = url.toLowerCase();
      if (lower.startsWith('data:image/')) return true;
      return /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(lower);
    } catch {
      return false;
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryName = category?.name || categoryId;

    if (onCategoryClick) {
      onCategoryClick(categoryName);
    } else {
      // Default behavior: navigate to blogs page with category filter
      window.location.href = `/blogs?category=${encodeURIComponent(categoryName)}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6 mb-6">
      <h3 className="text-base md:text-lg font-semibold text-[#0f766e] mb-3 md:mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
        Categories
      </h3>

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#0f766e]"></div>
        </div>
      ) : categories.length === 0 ? (
        <p className="text-slate-500 text-xs md:text-sm">No categories available</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3 md:space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center space-x-2 md:space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200"
              onClick={() => handleCategoryClick(category.id)}
            >
              {isImageUrl(category.icon || category.icon_url) ? (
                <img
                  src={(category.icon || category.icon_url) as string}
                  alt={`${category.name} icon`}
                  className="w-5 h-5 md:w-6 md:h-6 object-cover rounded"
                  loading="lazy"
                />
              ) : (
                <div className="w-5 h-5 md:w-6 md:h-6 bg-[#f0fdfa] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0f766e] font-semibold text-xs md:text-sm">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm md:text-sm text-slate-700 hover:text-[#0f766e] transition-all duration-200 truncate">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
