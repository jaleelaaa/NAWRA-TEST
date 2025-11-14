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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-yellow-50/10 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/70 to-emerald-900/40 lg:hidden z-40 animate-fade-in backdrop-blur-sm"
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
        } fixed lg:translate-x-0 top-0 h-screen w-72 bg-gradient-to-b from-white to-emerald-50/30 shadow-2xl shadow-emerald-900/10 transition-transform duration-300 z-50 lg:z-30 overflow-y-auto flex flex-col border-r-2 border-emerald-200/50`}
      >
        {/* Sidebar Header with Oman Theme */}
        <div className={`px-6 py-6 bg-gradient-to-r from-emerald-700 to-emerald-800 border-b-2 border-yellow-500/30 shadow-lg ${isRTL ? 'text-right' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-300 drop-shadow-md flex items-center gap-2">
                <BookMarked className="w-6 h-6" />
                NAWRA
              </h1>
              <p className="text-xs text-emerald-50 mt-1 font-medium">
                {locale === 'ar' ? 'نظام إدارة المكتبة' : 'Library Management'}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-emerald-100 hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-emerald-600/30"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Menu with Enhanced Styling */}
        <nav className="px-4 py-6 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg shadow-emerald-900/30 border-l-4 border-yellow-500'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/50 hover:text-emerald-800 hover:shadow-md hover:border-l-4 hover:border-emerald-300'
                }`}
              >
                {!isRTL && (
                  <div className={`p-1.5 rounded-md transition-all duration-300 ${
                    active ? 'bg-yellow-500/20' : 'group-hover:bg-emerald-200/50'
                  }`}>
                    <Icon size={20} className={active ? 'text-yellow-300' : 'group-hover:text-emerald-700'} />
                  </div>
                )}
                <span className={`font-semibold flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {item.label}
                </span>
                {isRTL && (
                  <div className={`p-1.5 rounded-md transition-all duration-300 ${
                    active ? 'bg-yellow-500/20' : 'group-hover:bg-emerald-200/50'
                  }`}>
                    <Icon size={20} className={active ? 'text-yellow-300' : 'group-hover:text-emerald-700'} />
                  </div>
                )}
                {active && !isRTL && <ChevronRight size={18} className="animate-slide-in-left text-yellow-300" />}
                {active && isRTL && <ChevronRight size={18} className="animate-slide-in-right rotate-180 text-yellow-300" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout with Enhanced Styling */}
        <div className={`p-4 border-t-2 border-emerald-200/50 bg-gradient-to-r from-red-50/50 to-white ${isRTL ? 'text-right' : ''}`}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 rounded-lg transition-all duration-300 font-semibold border-2 border-transparent hover:border-red-200 shadow-sm hover:shadow-md group"
          >
            {!isRTL && <LogOut size={20} className="group-hover:rotate-12 transition-transform duration-300" />}
            <span className="flex-1">{t('nav.logout')}</span>
            {isRTL && <LogOut size={20} className="group-hover:rotate-12 transition-transform duration-300" />}
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
        {/* Top Header with Enhanced Oman Theme */}
        <header className="bg-gradient-to-r from-white via-emerald-50/30 to-white shadow-md border-b-2 border-emerald-200/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-emerald-700 hover:text-emerald-900 p-2 rounded-lg hover:bg-emerald-100/50 transition-all duration-300"
              >
                <Menu size={24} />
              </button>

              {/* Page Title - Hidden on mobile, shown on larger screens */}
              <div className={`hidden lg:block ${isRTL ? 'text-right' : 'text-left'}`}>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent flex items-center gap-2">
                  {menuItems.find((item) => isActive(item.href))?.label || t('nav.dashboard')}
                </h2>
              </div>

              {/* Right Side - User Menu & Language Switcher */}
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Language Switcher */}
                <div className="hover:scale-105 transition-transform duration-300">
                  <LanguageSwitcher />
                </div>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-emerald-100/50 hover:text-emerald-700 transition-all duration-300 hover:scale-110 group"
                >
                  <Bell size={20} className="group-hover:animate-pulse" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-3 hover:bg-gradient-to-r hover:from-emerald-100/50 hover:to-emerald-50 rounded-lg px-3 py-2 transition-all duration-300 border-2 border-transparent hover:border-emerald-200 shadow-sm hover:shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-9 w-9 ring-2 ring-emerald-200 ring-offset-2 transition-all duration-300 hover:ring-emerald-400">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-700 to-emerald-800 text-yellow-300 font-bold">
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`hidden md:block ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-emerald-700 font-medium">{user?.role || 'Staff'}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56 border-2 border-emerald-200/50 shadow-lg">
                    <DropdownMenuLabel className={`${isRTL ? 'text-right' : ''} text-emerald-800 font-bold`}>
                      {t('nav.myAccount')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-emerald-200/50" />
                    <DropdownMenuItem className={`${isRTL ? 'flex-row-reverse' : ''} hover:bg-emerald-50 cursor-pointer`}>
                      <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-emerald-700`} />
                      <span>{t('nav.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`${isRTL ? 'flex-row-reverse' : ''} hover:bg-emerald-50 cursor-pointer`}>
                      <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} text-emerald-700`} />
                      <span>{t('nav.settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-emerald-200/50" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className={`text-red-600 ${isRTL ? 'flex-row-reverse' : ''} hover:bg-red-50 cursor-pointer font-medium`}
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
