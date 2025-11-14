'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <nav className={`flex items-center gap-2 text-sm text-[#6B7280] mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight
              size={16}
              className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`}
            />
          )}

          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#8B1538] transition-colors cursor-pointer font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#8B1538] font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
