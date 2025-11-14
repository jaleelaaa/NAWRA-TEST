'use client';

import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';

/**
 * Skeleton loader for user cards
 * Shows animated placeholders while data is loading
 */
export function UserCardSkeleton() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
    >
      {/* Header with avatar and status */}
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar skeleton */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
          {/* Status indicator skeleton */}
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-gray-300 border-2 border-white" />
        </div>

        {/* Name and ID skeleton */}
        <div className="flex-1">
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-3/4 mb-2" />
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/2" />
        </div>

        {/* Menu button skeleton */}
        <div className="w-8 h-8 rounded-full bg-gray-200" />
      </div>

      {/* Email skeleton */}
      <div className="mb-4">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-2/3" />
      </div>

      {/* Role and status badges skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-full w-20" />
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-full w-16" />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-2/3" />
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-2/3" />
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-2/3" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Grid of skeleton cards
 * Used to show loading state for the entire user grid
 */
interface UserCardSkeletonGridProps {
  count?: number;
}

export function UserCardSkeletonGrid({ count = 12 }: UserCardSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <UserCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Stats card skeleton loader
 * Shows animated placeholders for statistics cards
 */
export function StatsCardSkeleton() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
    >
      {/* Icon skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
        <div className="w-16 h-6 rounded-full bg-gray-200" />
      </div>

      {/* Value skeleton */}
      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/2 mb-2" />

      {/* Label skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </motion.div>
  );
}

/**
 * Stats bar skeleton loader
 * Shows animated placeholders for the stats bar
 */
export function StatsBarSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  );
}
