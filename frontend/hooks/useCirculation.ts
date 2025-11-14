/**
 * React Query hooks for Circulation Management
 *
 * Custom hooks for managing circulation (loans, reservations, fines) state with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  // Loan operations
  getLoans,
  getLoanById,
  checkoutBook,
  checkinBook,
  renewLoan,
  getOverdueLoans,
  getUserLoans,
  // Reservation operations
  getReservations,
  getReservationById,
  createReservation,
  cancelReservation,
  fulfillReservation,
  getUserReservations,
  // Fine operations
  getFines,
  getFineById,
  getUserFines,
  payFine,
  waiveFine,
  // Statistics
  getCirculationStatistics,
} from '@/lib/api/circulation';
import type {
  Loan,
  Reservation,
  Fine,
  CirculationFilters,
  CheckoutRequest,
  CheckinRequest,
  RenewRequest,
  ReservationRequest,
  PaginatedResponse,
} from '@/lib/api/types';

// ============================================================================
// Query Keys
// ============================================================================

export const circulationKeys = {
  all: ['circulation'] as const,
  // Loans
  loans: () => [...circulationKeys.all, 'loans'] as const,
  loan: (id: string) => [...circulationKeys.loans(), id] as const,
  loansList: (filters: CirculationFilters) => [...circulationKeys.loans(), 'list', filters] as const,
  loansOverdue: () => [...circulationKeys.loans(), 'overdue'] as const,
  loansUser: (userId: string) => [...circulationKeys.loans(), 'user', userId] as const,
  // Reservations
  reservations: () => [...circulationKeys.all, 'reservations'] as const,
  reservation: (id: string) => [...circulationKeys.reservations(), id] as const,
  reservationsList: (filters: CirculationFilters) => [...circulationKeys.reservations(), 'list', filters] as const,
  reservationsUser: (userId: string) => [...circulationKeys.reservations(), 'user', userId] as const,
  // Fines
  fines: () => [...circulationKeys.all, 'fines'] as const,
  fine: (id: string) => [...circulationKeys.fines(), id] as const,
  finesList: (filters: CirculationFilters) => [...circulationKeys.fines(), 'list', filters] as const,
  finesUser: (userId: string) => [...circulationKeys.fines(), 'user', userId] as const,
  // Statistics
  statistics: () => [...circulationKeys.all, 'statistics'] as const,
};

// ============================================================================
// Loan Query Hooks
// ============================================================================

/**
 * Get all loans with filters and pagination
 */
export function useLoans(filters?: CirculationFilters) {
  return useQuery({
    queryKey: circulationKeys.loansList(filters || {}),
    queryFn: () => getLoans(filters),
    staleTime: 10 * 1000, // 10 seconds - circulation changes frequently
  });
}

/**
 * Get loan by ID
 */
export function useLoan(loanId: string) {
  return useQuery({
    queryKey: circulationKeys.loan(loanId),
    queryFn: () => getLoanById(loanId),
    enabled: !!loanId,
  });
}

/**
 * Get overdue loans
 */
export function useOverdueLoans() {
  return useQuery({
    queryKey: circulationKeys.loansOverdue(),
    queryFn: getOverdueLoans,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Get user's active loans
 */
export function useUserLoans(userId: string) {
  return useQuery({
    queryKey: circulationKeys.loansUser(userId),
    queryFn: () => getUserLoans(userId),
    enabled: !!userId,
    staleTime: 10 * 1000,
  });
}

// ============================================================================
// Loan Mutation Hooks
// ============================================================================

/**
 * Checkout book (create loan)
 */
export function useCheckoutBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkoutData: CheckoutRequest) => checkoutBook(checkoutData),
    onSuccess: (loan) => {
      // Invalidate all circulation queries
      queryClient.invalidateQueries({ queryKey: circulationKeys.all });
      // Invalidate book queries (availability changed)
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book checked out successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to checkout book';
      toast.error(message);
    },
  });
}

/**
 * Checkin book (return loan)
 */
export function useCheckinBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkinData: CheckinRequest) => checkinBook(checkinData),
    onSuccess: (loan) => {
      // Invalidate all circulation queries
      queryClient.invalidateQueries({ queryKey: circulationKeys.all });
      // Invalidate book queries
      queryClient.invalidateQueries({ queryKey: ['books'] });

      // Show fine information if applicable
      if (loan.fine_amount && loan.fine_amount > 0) {
        toast.success(`Book returned. Fine: ${loan.fine_amount} OMR`, {
          duration: 5000,
        });
      } else {
        toast.success('Book returned successfully');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to checkin book';
      toast.error(message);
    },
  });
}

/**
 * Renew loan
 */
export function useRenewLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (renewData: RenewRequest) => renewLoan(renewData),
    onSuccess: (loan) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all });
      queryClient.invalidateQueries({ queryKey: circulationKeys.loan(loan.id) });
      toast.success('Loan renewed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to renew loan';
      toast.error(message);
    },
  });
}

// ============================================================================
// Reservation Query Hooks
// ============================================================================

/**
 * Get all reservations with filters
 */
export function useReservations(filters?: CirculationFilters) {
  return useQuery({
    queryKey: circulationKeys.reservationsList(filters || {}),
    queryFn: () => getReservations(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get reservation by ID
 */
export function useReservation(reservationId: string) {
  return useQuery({
    queryKey: circulationKeys.reservation(reservationId),
    queryFn: () => getReservationById(reservationId),
    enabled: !!reservationId,
  });
}

/**
 * Get user's active reservations
 */
export function useUserReservations(userId: string) {
  return useQuery({
    queryKey: circulationKeys.reservationsUser(userId),
    queryFn: () => getUserReservations(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Reservation Mutation Hooks
// ============================================================================

/**
 * Create reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationData: ReservationRequest) => createReservation(reservationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book reserved successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to create reservation';
      toast.error(message);
    },
  });
}

/**
 * Cancel reservation
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.reservations() });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Reservation cancelled successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to cancel reservation';
      toast.error(message);
    },
  });
}

/**
 * Fulfill reservation (convert to loan)
 */
export function useFulfillReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => fulfillReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Reservation fulfilled - book checked out');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to fulfill reservation';
      toast.error(message);
    },
  });
}

// ============================================================================
// Fine Query Hooks
// ============================================================================

/**
 * Get all fines with filters
 */
export function useFines(filters?: CirculationFilters) {
  return useQuery({
    queryKey: circulationKeys.finesList(filters || {}),
    queryFn: () => getFines(filters),
    staleTime: 30 * 1000,
  });
}

/**
 * Get fine by ID
 */
export function useFine(fineId: string) {
  return useQuery({
    queryKey: circulationKeys.fine(fineId),
    queryFn: () => getFineById(fineId),
    enabled: !!fineId,
  });
}

/**
 * Get user's fines
 */
export function useUserFines(userId: string) {
  return useQuery({
    queryKey: circulationKeys.finesUser(userId),
    queryFn: () => getUserFines(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// Fine Mutation Hooks
// ============================================================================

/**
 * Pay fine
 */
export function usePayFine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fineId: string) => payFine(fineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.fines() });
      toast.success('Fine paid successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to pay fine';
      toast.error(message);
    },
  });
}

/**
 * Waive fine
 */
export function useWaiveFine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fineId: string) => waiveFine(fineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.fines() });
      toast.success('Fine waived successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to waive fine';
      toast.error(message);
    },
  });
}

// ============================================================================
// Statistics Hook
// ============================================================================

/**
 * Get circulation statistics
 */
export function useCirculationStatistics() {
  return useQuery({
    queryKey: circulationKeys.statistics(),
    queryFn: getCirculationStatistics,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// ============================================================================
// Prefetch Utilities
// ============================================================================

/**
 * Prefetch loan details
 */
export function usePrefetchLoan() {
  const queryClient = useQueryClient();

  return (loanId: string) => {
    queryClient.prefetchQuery({
      queryKey: circulationKeys.loan(loanId),
      queryFn: () => getLoanById(loanId),
    });
  };
}

/**
 * Prefetch reservation details
 */
export function usePrefetchReservation() {
  const queryClient = useQueryClient();

  return (reservationId: string) => {
    queryClient.prefetchQuery({
      queryKey: circulationKeys.reservation(reservationId),
      queryFn: () => getReservationById(reservationId),
    });
  };
}
