import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import AdminLayout from '@/components/AdminLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatCard from '@/components/dashboard/StatCard';
import ChartsSection from '@/components/dashboard/ChartsSection';
import PopularBooks from '@/components/dashboard/PopularBooks';
import OverdueAlerts from '@/components/dashboard/OverdueAlerts';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  // Statistics data with sparkline data (using mock data for now)
  const stats = [
    {
      title: locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
      value: '1,284',
      change: '+12%',
      trend: 'up' as const,
      iconName: 'users' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      sparklineData: [
        { value: 1100 },
        { value: 1150 },
        { value: 1200 },
        { value: 1180 },
        { value: 1220 },
        { value: 1250 },
        { value: 1284 },
      ],
      subtitle: locale === 'ar' ? 'مقارنة بالشهر الماضي' : 'Compared to last month',
    },
    {
      title: locale === 'ar' ? 'إجمالي الكتب' : 'Total Books',
      value: '8,542',
      change: '+8%',
      trend: 'up' as const,
      iconName: 'book' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      sparklineData: [
        { value: 8200 },
        { value: 8250 },
        { value: 8350 },
        { value: 8400 },
        { value: 8450 },
        { value: 8500 },
        { value: 8542 },
      ],
      subtitle: locale === 'ar' ? 'مقارنة بالشهر الماضي' : 'Compared to last month',
    },
    {
      title: locale === 'ar' ? 'الكتب المستعارة' : 'Books Borrowed',
      value: '342',
      change: '+18%',
      trend: 'up' as const,
      iconName: 'book-open' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      sparklineData: [
        { value: 280 },
        { value: 290 },
        { value: 310 },
        { value: 305 },
        { value: 320 },
        { value: 335 },
        { value: 342 },
      ],
      subtitle: locale === 'ar' ? 'مقارنة بالشهر الماضي' : 'Compared to last month',
    },
    {
      title: locale === 'ar' ? 'الكتب المتأخرة' : 'Overdue Books',
      value: '23',
      change: '-5%',
      trend: 'down' as const,
      iconName: 'alert-circle' as const,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      sparklineData: [
        { value: 30 },
        { value: 28 },
        { value: 26 },
        { value: 27 },
        { value: 25 },
        { value: 24 },
        { value: 23 },
      ],
      subtitle: locale === 'ar' ? 'مقارنة بالشهر الماضي' : 'Compared to last month',
    },
  ];

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-3 md:space-y-4">
        {/* Welcome Banner */}
        <section
          aria-label={locale === 'ar' ? 'لافتة الترحيب' : 'Welcome banner'}
          className="bg-gradient-to-r from-[#8B2635] via-[#A03045] to-[#8B2635] rounded-xl p-3 md:p-4 text-white shadow-xl relative overflow-hidden animate-scale-in"
          style={{ backgroundSize: '200% 200%' }}
        >
          {/* Decorative elements with animations */}
          <div className="hidden md:block absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 md:-mr-32 md:-mt-32 animate-pulse"></div>
          <div className="hidden md:block absolute bottom-0 left-0 w-24 h-24 md:w-48 md:h-48 bg-white opacity-5 rounded-full -ml-12 -mb-12 md:-ml-24 md:-mb-24 animate-pulse"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">
              {locale === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to the Dashboard'}
            </h1>
            <div className="relative overflow-hidden whitespace-nowrap">
              <div className={`inline-block ${locale === 'ar' ? 'animate-scroll-right' : 'animate-scroll-left'}`}>
                <span className="text-white/90 text-xs md:text-sm lg:text-base inline-block px-8">
                  {locale === 'ar'
                    ? 'نظام إدارة المكتبة NAWRA - وزارة التربية والتعليم، سلطنة عمان'
                    : 'NAWRA Library Management System - Ministry of Education, Sultanate of Oman'}
                </span>
                <span className="text-white/90 text-xs md:text-sm lg:text-base inline-block px-8">
                  {locale === 'ar'
                    ? 'نظام إدارة المكتبة NAWRA - وزارة التربية والتعليم، سلطنة عمان'
                    : 'NAWRA Library Management System - Ministry of Education, Sultanate of Oman'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <section aria-label={locale === 'ar' ? 'إحصائيات النظام' : 'System statistics'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              iconName={stat.iconName}
              color={stat.color}
              bgColor={stat.bgColor}
              sparklineData={stat.sparklineData}
              subtitle={stat.subtitle}
              locale={locale}
            />
          ))}
        </section>

        {/* Charts Section */}
        <section aria-label={locale === 'ar' ? 'الرسوم البيانية والإحصائيات' : 'Charts and statistics'}>
          <ChartsSection locale={locale} />
        </section>

        {/* Two Column Layout: Popular Books & Overdue Alerts */}
        <section aria-label={locale === 'ar' ? 'الكتب الشائعة والتنبيهات' : 'Popular books and alerts'} className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          <PopularBooks locale={locale} />
          <OverdueAlerts locale={locale} />
        </section>

        {/* Activity Feed */}
        <section aria-label={locale === 'ar' ? 'آخر الأنشطة' : 'Recent activity'}>
          <ActivityFeed locale={locale} />
        </section>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
