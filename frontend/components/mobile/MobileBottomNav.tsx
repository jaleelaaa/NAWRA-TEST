'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Scan, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activePattern: RegExp;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      activePattern: /\/dashboard$/,
    },
    {
      href: '/admin/catalog',
      label: 'Search',
      icon: Search,
      activePattern: /\/catalog/,
    },
    {
      href: '/admin/circulation',
      label: 'Scan',
      icon: Scan,
      activePattern: /\/circulation/,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: User,
      activePattern: /\/settings/,
    },
  ];

  const isActive = (pattern: RegExp) => {
    return pattern.test(pathname);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.activePattern);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
