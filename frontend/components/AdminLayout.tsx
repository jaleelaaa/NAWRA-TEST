'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Home,
  Book,
  Users,
  Settings,
  BarChart3,
  BookMarked,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  Globe,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const { user, logout } = useAuthStore();

  const isRTL = locale === 'ar';

  // Navigation menu items
  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home, href: '/dashboard' },
    { id: 'users', label: t('nav.users'), icon: Users, href: '/admin/users' },
    { id: 'catalog', label: t('nav.catalog'), icon: Book, href: '/admin/catalog' },
    { id: 'circulation', label: t('nav.circulation'), icon: BookMarked, href: '/admin/circulation' },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3, href: '/admin/reports' },
    { id: 'guide', label: t('nav.guide'), icon: BookOpen, href: '/admin/guide' },
    { id: 'settings', label: t('nav.settings'), icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = `/${locale}/login`;
  };

  // Check if current path is active
  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 lg:hidden z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          right: isRTL ? '0' : 'auto',
          left: isRTL ? 'auto' : '0',
        }}
        className={`${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } fixed lg:translate-x-0 top-0 h-screen w-72 bg-white shadow-xl transition-transform duration-300 z-50 lg:z-30 overflow-y-auto flex flex-col border-r border-gray-200`}
      >
        {/* Sidebar Header */}
        <div className={`px-6 py-6 border-b border-gray-200 ${isRTL ? 'text-right' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#8B2635]">NAWRA</h1>
              <p className="text-xs text-gray-600 mt-1">
                {locale === 'ar' ? 'نظام إدارة المكتبة' : 'Library Management'}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 py-6 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-[#8B2635] to-[#6B1F2E] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#8B2635]'
                }`}
              >
                {!isRTL && <Icon size={20} className={active ? 'text-white' : ''} />}
                <span className={`font-medium flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {item.label}
                </span>
                {isRTL && <Icon size={20} className={active ? 'text-white' : ''} />}
                {active && !isRTL && <ChevronRight size={18} className="animate-slide-in-left" />}
                {active && isRTL && <ChevronRight size={18} className="animate-slide-in-right rotate-180" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className={`p-4 border-t border-gray-200 ${isRTL ? 'text-right' : ''}`}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
          >
            {!isRTL && <LogOut size={20} />}
            <span className="flex-1">{t('nav.logout')}</span>
            {isRTL && <LogOut size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          marginRight: isRTL ? '288px' : '0',
          marginLeft: isRTL ? '0' : '288px',
        }}
        className="min-h-screen max-lg:!ml-0 max-lg:!mr-0"
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-700 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>

              {/* Page Title - Hidden on mobile, shown on larger screens */}
              <div className={`hidden lg:block ${isRTL ? 'text-right' : 'text-left'}`}>
                <h2 className="text-2xl font-bold text-gray-900">
                  {menuItems.find((item) => isActive(item.href))?.label || t('nav.dashboard')}
                </h2>
              </div>

              {/* Right Side - User Menu & Language Switcher */}
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#8B2635] text-white">
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.role || 'Staff'}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                    <DropdownMenuLabel className={isRTL ? 'text-right' : ''}>
                      {t('nav.myAccount')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className={isRTL ? 'flex-row-reverse' : ''}>
                      <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span>{t('nav.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={isRTL ? 'flex-row-reverse' : ''}>
                      <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span>{t('nav.settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className={`text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
