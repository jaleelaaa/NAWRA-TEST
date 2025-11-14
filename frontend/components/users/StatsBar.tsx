'use client';

import { Users, UserCheck, UserPlus, UserX, TrendingUp } from 'lucide-react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { containerVariants, cardVariants, scaleVariants } from '@/lib/animations';
import type { DashboardUser } from '@/lib/types/users';

/**
 * Animated counter component that counts up to the target value
 */
function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { duration: 1000 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  staff_count: number;
  patron_count: number;
}

interface StatsBarProps {
  users: DashboardUser[];
  stats?: UserStats;
}

export function StatsBar({ users, stats }: StatsBarProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Use API stats if available, otherwise calculate from users array
  const totalUsers = stats?.total_users || users.length;
  const activeUsers = stats?.active_users || users.filter((u) => u.status === 'active').length;
  const pendingUsers = users.filter((u) => u.status === 'pending').length;
  const inactiveUsers = stats?.inactive_users || users.filter((u) => u.status === 'inactive').length;

  const statCards = [
    {
      label: t('stats.totalUsers'),
      value: totalUsers,
      change: '+12%',
      icon: Users,
      color: 'text-[#8B1538]',
      bgColor: 'bg-[#8B1538]/10',
      borderColor: 'border-l-[#8B1538]',
      gradient: 'from-red-50 to-pink-50',
    },
    {
      label: t('stats.activeUsers'),
      value: activeUsers,
      change: '+8%',
      icon: UserCheck,
      color: 'text-[#00693E]',
      bgColor: 'bg-[#00693E]/10',
      borderColor: 'border-l-[#00693E]',
      gradient: 'from-green-50 to-emerald-50',
    },
    {
      label: t('stats.pending'),
      value: pendingUsers,
      change: `+${pendingUsers}`,
      icon: UserPlus,
      color: 'text-[#0284C7]',
      bgColor: 'bg-[#0284C7]/10',
      borderColor: 'border-l-[#0284C7]',
      gradient: 'from-blue-50 to-cyan-50',
    },
    {
      label: t('stats.inactive'),
      value: inactiveUsers,
      change: '-5%',
      icon: UserX,
      color: 'text-[#6B7280]',
      bgColor: 'bg-[#6B7280]/10',
      borderColor: 'border-l-[#6B7280]',
      gradient: 'from-gray-50 to-slate-50',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="popLayout">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            layout
          >
            <div
              className={`bg-gradient-to-br ${stat.gradient} border-l-4 ${stat.borderColor} ${
                isRTL ? 'border-l-0 border-r-4' : ''
              } rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 h-full`}
            >
              <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <motion.div
                  className="text-sm text-[#6B7280] font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {stat.label}
                </motion.div>
                <motion.div
                  className={`p-2.5 rounded-xl ${stat.bgColor}`}
                  variants={scaleVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </motion.div>
              </div>

              <motion.div
                className={`text-3xl font-bold text-gray-900 mb-2`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
              >
                <AnimatedCounter value={stat.value} />
              </motion.div>

              <motion.div
                className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <TrendingUp className="h-4 w-4 text-[#00693E]" />
                <span className="text-sm text-[#00693E] font-medium">
                  {stat.change}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
