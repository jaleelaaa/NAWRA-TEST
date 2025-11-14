"use client";

import { useTranslations } from 'next-intl';
import { BookOpen, Shield } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const t = useTranslations('login');

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with Oman Theme */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 relative overflow-hidden">
        {/* Animated Decorative Elements - Oman Colors */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white animate-fade-in">
          {/* Book Icon with Oman Gold Border */}
          <div className="mb-8 p-6 glass rounded-2xl shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-glow-lg border-2 border-yellow-500/30">
            <BookOpen className="w-16 h-16 text-yellow-300" />
          </div>

          {/* Title with Professional Style */}
          <h1 className="text-5xl font-bold mb-4 text-center animate-slide-down drop-shadow-lg">
            {t('branding.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-emerald-50 mb-12 text-center animate-slide-up max-w-md">
            {t('branding.subtitle')}
          </p>

          {/* Security Notice with Oman Theme */}
          <div className="max-w-md w-full p-6 glass-card rounded-xl border-2 border-yellow-500/20 shadow-colored animate-scale-in hover:shadow-glow transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <Shield className="w-6 h-6 text-yellow-300 flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">{t('branding.secureTitle')}</h3>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  {t('branding.secureDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-emerald-50/20 to-yellow-50/10 relative">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-6 right-6 z-50 animate-slide-down">
          <LanguageSwitcher />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-xl shadow-colored hover:shadow-glow-lg transition-all duration-300 border-2 border-yellow-500/30">
              <BookOpen className="w-12 h-12 text-yellow-300" />
            </div>
          </div>

          {/* Form Card with Oman Ministry Style */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border-2 border-emerald-100 hover:shadow-colored transition-all duration-300">
            {/* Header */}
            <div className="text-center space-y-2 pb-4 border-b-2 border-emerald-600/20">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">
                {t('title')}
              </h2>
              <p className="mt-2 text-sm text-gray-700 font-medium">
                {t('subtitle')}
              </p>
            </div>

            {/* Login Form Component */}
            <LoginForm />
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-sm text-gray-700 hover:text-emerald-800 transition-colors font-medium">
            {t('needHelp')}
          </p>
        </div>
      </div>
    </div>
  );
}
