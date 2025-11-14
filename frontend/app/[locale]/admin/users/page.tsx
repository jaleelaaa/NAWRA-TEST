'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { StatsBar } from '@/components/users/StatsBar';
import { StatsBarSkeleton } from '@/components/users/UserCardSkeleton';
import { ActionBar } from '@/components/users/ActionBar';
import { UserGrid } from '@/components/users/UserGrid';
import { UserCardSkeletonGrid } from '@/components/users/UserCardSkeleton';
import { UserPagination } from '@/components/users/UserPagination';
import { UserModal } from '@/components/users/UserModal';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { BulkActionsBar } from '@/components/users/BulkActionsBar';
import { useTranslations, useLocale } from 'next-intl';
import type { DashboardUser, ViewMode } from '@/lib/types/users';
import type { SortField, SortOrder } from '@/components/users/SortDropdown';
import { getUsers, getUserStats, createUser, updateUser, deleteUser, exportUsers } from '@/lib/api/users';
import { queryKeys } from '@/lib/api/queryClient';
import { handleApiError } from '@/lib/api/client';
import type { UserDetail, UserFilters as ApiUserFilters } from '@/lib/api/types';
import { useToast } from '@/hooks/use-toast';

// Normalize database role names to translation keys
function normalizeRole(dbRole: string): 'admin' | 'librarian' | 'teacher' | 'student' | 'patron' | 'cataloger' | 'circulation_staff' | 'administrator' {
  const roleMap: Record<string, 'admin' | 'librarian' | 'teacher' | 'student' | 'patron' | 'cataloger' | 'circulation_staff' | 'administrator'> = {
    'Administrator': 'administrator',
    'Admin': 'admin',
    'Librarian': 'librarian',
    'Cataloger': 'cataloger',
    'Circulation Staff': 'circulation_staff',
    'Patron': 'patron',
    'Student': 'student',
    'Teacher': 'teacher',
  };

  return roleMap[dbRole] || dbRole.toLowerCase().replace(/\s+/g, '_') as any;
}

// Transform API UserDetail to DashboardUser
function transformUserToDashboard(user: UserDetail): DashboardUser {
  return {
    id: user.id,
    full_name: user.full_name,
    arabic_name: user.arabic_name, // Now supported in API
    email: user.email,
    role: normalizeRole(user.role),
    user_type: user.user_type,
    status: user.is_active ? 'active' : 'inactive',
    avatar: undefined,
    is_online: false, // TODO: Add real-time status
    user_id: user.id,
    books_borrowed: 0, // TODO: Fetch from circulation API
    fines: 0, // TODO: Fetch from circulation API
    last_login: user.last_login || 'Never',
    phone: user.phone,
    address: user.address,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export default function UsersPage() {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const tn = useTranslations('nav');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Build API filters
  const apiFilters: ApiUserFilters = {
    page: currentPage,
    page_size: itemsPerPage,
    search: searchQuery || undefined,
    role: filterRole !== 'all' ? filterRole : undefined,
    is_active: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  // Fetch users with React Query
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: queryKeys.users.list(apiFilters),
    queryFn: () => getUsers(apiFilters),
    staleTime: 30000, // 30 seconds
  });

  // Fetch user statistics
  const {
    data: statsData,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: getUserStats,
    staleTime: 60000, // 1 minute
  });

  // Transform API users to dashboard users
  const allUsers: DashboardUser[] = useMemo(() => {
    if (!usersData?.items) return [];
    return usersData.items.map(transformUserToDashboard);
  }, [usersData]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      toast({
        title: t('notifications.success'),
        description: t('notifications.userCreated'),
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({
        title: t('notifications.success'),
        description: t('notifications.userUpdated'),
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      toast({
        title: t('notifications.success'),
        description: t('notifications.userDeleted'),
      });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    },
  });

  // Pagination
  const totalPages = usersData?.total_pages || 0;
  const totalItems = usersData?.total || 0;

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus, itemsPerPage]);

  const handleEditUser = (user: DashboardUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (data: Partial<DashboardUser>) => {
    if (selectedUser) {
      // Update existing user
      updateUserMutation.mutate({
        userId: selectedUser.id,
        data: {
          full_name: data.full_name,
          email: data.email,
          role_id: data.role,
          is_active: data.status === 'active',
          phone: data.phone,
          address: data.address,
        },
      });
    } else {
      // Create new user
      createUserMutation.mutate({
        full_name: data.full_name!,
        email: data.email!,
        password: 'temporary123', // TODO: Generate or get from form
        user_type: data.user_type || 'Patron',
        role_id: data.role,
        phone: data.phone,
        address: data.address,
      });
    }
  };

  const handleDeleteUser = (user: DashboardUser) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: t('notifications.info'),
        description: t('notifications.exporting'),
      });

      // Export users with current filters
      const blob = await exportUsers(apiFilters, 'csv');

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t('notifications.success'),
        description: t('notifications.exportSuccess'),
      });
    } catch (error) {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    }
  };

  // Sorting handlers
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Selection handlers
  const handleSelectionModeChange = (enabled: boolean) => {
    setSelectionMode(enabled);
    if (!enabled) {
      setSelectedUsers(new Set());
    }
  };

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedUsers(new Set());
    setSelectionMode(false);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    try {
      // Delete all selected users
      const deletePromises = Array.from(selectedUsers).map((userId) => deleteUser(userId));
      await Promise.all(deletePromises);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });

      toast({
        title: t('notifications.success'),
        description: t('messages.bulkDeleteSuccess', { count: selectedUsers.size }),
      });

      // Clear selection
      setSelectedUsers(new Set());
      setSelectionMode(false);
    } catch (error) {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    }
  };

  const handleBulkActivate = async () => {
    if (selectedUsers.size === 0) return;

    try {
      // Activate all selected users
      const updatePromises = Array.from(selectedUsers).map((userId) =>
        updateUser(userId, { is_active: true })
      );
      await Promise.all(updatePromises);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });

      toast({
        title: t('notifications.success'),
        description: t('messages.bulkActivateSuccess', { count: selectedUsers.size }),
      });

      // Clear selection
      setSelectedUsers(new Set());
      setSelectionMode(false);
    } catch (error) {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) return;

    try {
      // Deactivate all selected users
      const updatePromises = Array.from(selectedUsers).map((userId) =>
        updateUser(userId, { is_active: false })
      );
      await Promise.all(updatePromises);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });

      toast({
        title: t('notifications.success'),
        description: t('messages.bulkDeactivateSuccess', { count: selectedUsers.size }),
      });

      // Clear selection
      setSelectedUsers(new Set());
      setSelectionMode(false);
    } catch (error) {
      const message = handleApiError(error);
      toast({
        variant: 'destructive',
        title: t('notifications.error'),
        description: message,
      });
    }
  };

  // Show loading state with skeletons
  if (usersLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6 bg-[#F5F1E8] min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm text-[#6B7280] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{tn('dashboard')}</span>
              <span>/</span>
              <span className="text-[#8B1538] font-medium">{t('title')}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#8B1538]">{t('title')}</h1>
            <p className="text-[#6B7280]">{t('subtitle')}</p>
          </div>

          {/* Stats Bar Skeleton */}
          <StatsBarSkeleton />

          {/* User Grid Skeleton */}
          <UserCardSkeletonGrid count={itemsPerPage} />
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (usersError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#F5F1E8]">
          <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
            <div className="text-[#DC2626] text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-[#8B1538] mb-2">{tc('error')}</h2>
            <p className="text-[#6B7280] mb-4">{handleApiError(usersError)}</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.users.all })}
              className="px-4 py-2 bg-[#8B1538] text-white rounded-lg hover:bg-[#A61D45]"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 bg-[#F5F1E8] min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm text-[#6B7280] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>{tn('dashboard')}</span>
            <span>/</span>
            <span className="text-[#8B1538] font-medium">{t('title')}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#8B1538]">{t('title')}</h1>
          <p className="text-[#6B7280]">{t('subtitle')}</p>
        </div>

        {/* Stats Bar */}
        {statsData && <StatsBar users={allUsers} stats={statsData} />}

        {/* Action Bar */}
        <ActionBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterRole={filterRole}
          onFilterRoleChange={setFilterRole}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          selectionMode={selectionMode}
          onSelectionModeChange={handleSelectionModeChange}
          onAddUser={handleAddUser}
          onExport={handleExport}
        />

        {/* User Grid/Table */}
        {viewMode === 'grid' ? (
          allUsers.length > 0 ? (
            <UserGrid
              users={allUsers}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              selectionMode={selectionMode}
              selectedUsers={selectedUsers}
              onToggleUser={handleToggleUser}
            />
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-[#8B1538]/10 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-[#8B1538] mb-2">{t('noResults')}</h3>
              <p className="text-[#6B7280]">{t('noResultsDescription')}</p>
            </div>
          )
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#8B1538]/10">
            <p className="text-center text-[#6B7280]">
              {t('view.table')} - {tc('comingSoon')}
            </p>
          </div>
        )}

        {/* Pagination */}
        {allUsers.length > 0 && totalPages > 0 && (
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}

        {/* User Modal */}
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSave={handleSaveUser}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteUserDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
          }}
          user={userToDelete}
          onConfirm={confirmDelete}
          isDeleting={deleteUserMutation.isPending}
        />

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedUsers.size}
          onBulkDelete={handleBulkDelete}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          onClearSelection={handleClearSelection}
        />
      </div>
    </AdminLayout>
  );
}
