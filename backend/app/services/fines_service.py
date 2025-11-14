"""
Fines Service - Business logic for fines management.
Phase 3 - Enhanced Features (Day 14)
"""
from uuid import UUID
from typing import Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
from supabase import Client
from fastapi import HTTPException, status

from ..models.fines import (
    FineCreate, FineUpdate, FineWaiver, FineResponse, FineListResponse,
    FineStatistics, FineFilters, FineCalculationRequest, FineCalculationResponse,
    PaymentCreate, PaymentRefund, PaymentResponse, PaymentListResponse,
    PaymentStatistics, PaymentFilters,
    FineRuleCreate, FineRuleUpdate, FineRuleResponse, FineRuleListResponse, FineRuleFilters,
    FineStatus, PaymentStatus,
)


class FinesService:
    """Service for fines management operations."""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    # =====================================================
    # Fine CRUD Operations
    # =====================================================

    async def create_fine(self, fine: FineCreate, user_id: UUID) -> FineResponse:
        """Create a new fine."""
        try:
            data = fine.dict()
            data['created_by'] = str(user_id)
            data['current_amount'] = fine.original_amount
            data['status'] = 'pending'

            response = self.supabase.table("fines").insert(data).execute()

            if response.data:
                return await self.get_fine(UUID(response.data[0]['id']))

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create fine"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating fine: {str(e)}"
            )

    async def get_fine(self, fine_id: UUID) -> FineResponse:
        """Get fine by ID with joined data."""
        response = self.supabase.table("fines")\
            .select("*, users!fines_user_id_fkey(full_name, email), books(title, isbn)")\
            .eq("id", str(fine_id))\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fine not found"
            )

        fine_data = response.data

        # Flatten joined data
        if fine_data.get('users'):
            fine_data['user_name'] = fine_data['users'].get('full_name')
            fine_data['user_email'] = fine_data['users'].get('email')
            del fine_data['users']

        if fine_data.get('books'):
            fine_data['book_title'] = fine_data['books'].get('title')
            fine_data['book_isbn'] = fine_data['books'].get('isbn')
            del fine_data['books']

        return FineResponse(**fine_data)

    async def list_fines(self, filters: FineFilters) -> FineListResponse:
        """List fines with filters and pagination."""
        offset = (filters.page - 1) * filters.page_size

        # Build query
        query = self.supabase.table("fines")\
            .select("*, users!fines_user_id_fkey(full_name, email), books(title, isbn)", count="exact")

        # Apply filters
        if filters.user_id:
            query = query.eq("user_id", str(filters.user_id))
        if filters.book_id:
            query = query.eq("book_id", str(filters.book_id))
        if filters.circulation_id:
            query = query.eq("circulation_id", str(filters.circulation_id))
        if filters.fine_type:
            query = query.eq("fine_type", filters.fine_type.value)
        if filters.status:
            query = query.eq("status", filters.status.value)
        if filters.min_amount:
            query = query.gte("current_amount", float(filters.min_amount))
        if filters.max_amount:
            query = query.lte("current_amount", float(filters.max_amount))
        if filters.assessed_from:
            query = query.gte("assessed_date", filters.assessed_from.isoformat())
        if filters.assessed_to:
            query = query.lte("assessed_date", filters.assessed_to.isoformat())
        if filters.overdue_only:
            query = query.in_("status", ["pending", "partial"])

        # Sorting
        order_col = filters.sort_by
        if filters.sort_order == "desc":
            order_col += ".desc"

        # Execute query
        response = query.range(offset, offset + filters.page_size - 1)\
            .order(order_col)\
            .execute()

        # Process results
        fines = []
        for fine_data in response.data:
            if fine_data.get('users'):
                fine_data['user_name'] = fine_data['users'].get('full_name')
                fine_data['user_email'] = fine_data['users'].get('email')
                del fine_data['users']
            if fine_data.get('books'):
                fine_data['book_title'] = fine_data['books'].get('title')
                fine_data['book_isbn'] = fine_data['books'].get('isbn')
                del fine_data['books']
            fines.append(FineResponse(**fine_data))

        total = response.count or 0
        total_pages = (total + filters.page_size - 1) // filters.page_size

        return FineListResponse(
            data=fines,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages
        )

    async def update_fine(self, fine_id: UUID, update: FineUpdate) -> FineResponse:
        """Update fine details."""
        await self.get_fine(fine_id)  # Verify exists

        data = update.dict(exclude_unset=True)
        data['updated_at'] = datetime.utcnow().isoformat()

        response = self.supabase.table("fines")\
            .update(data)\
            .eq("id", str(fine_id))\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fine not found"
            )

        return await self.get_fine(fine_id)

    async def waive_fine(
        self, fine_id: UUID, waiver: FineWaiver, user_id: UUID
    ) -> FineResponse:
        """Waive part or all of a fine."""
        fine = await self.get_fine(fine_id)

        if fine.status in ['paid', 'waived', 'cancelled']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot waive fine with status: {fine.status}"
            )

        if waiver.waived_amount > fine.current_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Waived amount cannot exceed current amount"
            )

        new_waived = fine.waived_amount + waiver.waived_amount
        new_current = fine.original_amount - fine.paid_amount - new_waived

        data = {
            'waived_amount': float(new_waived),
            'current_amount': float(new_current),
            'waiver_reason': waiver.waiver_reason,
            'waiver_approved_by': str(user_id),
            'waived_date': date.today().isoformat(),
            'status': 'waived' if new_current <= 0 else 'partial',
            'updated_at': datetime.utcnow().isoformat()
        }

        response = self.supabase.table("fines")\
            .update(data)\
            .eq("id", str(fine_id))\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to waive fine"
            )

        return await self.get_fine(fine_id)

    async def delete_fine(self, fine_id: UUID):
        """Delete a fine (only if unpaid)."""
        fine = await self.get_fine(fine_id)

        if fine.paid_amount > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete fine with payments"
            )

        response = self.supabase.table("fines")\
            .delete()\
            .eq("id", str(fine_id))\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fine not found"
            )

    async def get_statistics(self) -> FineStatistics:
        """Get fine statistics."""
        # Total fines
        total_response = self.supabase.table("fines")\
            .select("*", count="exact")\
            .execute()
        total_fines = total_response.count or 0

        # Aggregate amounts
        all_fines = total_response.data
        total_amount = sum(Decimal(str(f.get('original_amount', 0))) for f in all_fines)
        total_outstanding = sum(Decimal(str(f.get('current_amount', 0))) for f in all_fines)
        total_paid = sum(Decimal(str(f.get('paid_amount', 0))) for f in all_fines)
        total_waived = sum(Decimal(str(f.get('waived_amount', 0))) for f in all_fines)

        # By status
        by_status = {}
        for st in FineStatus:
            count = sum(1 for f in all_fines if f.get('status') == st.value)
            by_status[st.value] = count

        # By type
        by_type = {}
        for f in all_fines:
            ft = f.get('fine_type', 'unknown')
            by_type[ft] = by_type.get(ft, 0) + 1

        # Top debtors
        user_debts = {}
        for f in all_fines:
            if f.get('status') in ['pending', 'partial']:
                uid = f.get('user_id')
                if uid:
                    user_debts[uid] = user_debts.get(uid, Decimal('0')) + Decimal(str(f.get('current_amount', 0)))

        top_debtors = sorted(
            [{'user_id': uid, 'total_owed': float(amt)} for uid, amt in user_debts.items()],
            key=lambda x: x['total_owed'],
            reverse=True
        )[:10]

        # Overdue aging
        today = date.today()
        overdue_30 = sum(1 for f in all_fines
                        if f.get('status') in ['pending', 'partial']
                        and f.get('assessed_date')
                        and (today - date.fromisoformat(f['assessed_date'])).days > 30)
        overdue_60 = sum(1 for f in all_fines
                        if f.get('status') in ['pending', 'partial']
                        and f.get('assessed_date')
                        and (today - date.fromisoformat(f['assessed_date'])).days > 60)
        overdue_90 = sum(1 for f in all_fines
                        if f.get('status') in ['pending', 'partial']
                        and f.get('assessed_date')
                        and (today - date.fromisoformat(f['assessed_date'])).days > 90)

        return FineStatistics(
            total_fines=total_fines,
            total_amount=total_amount,
            total_outstanding=total_outstanding,
            total_paid=total_paid,
            total_waived=total_waived,
            by_status=by_status,
            by_type=by_type,
            average_fine=total_amount / total_fines if total_fines > 0 else Decimal('0'),
            top_debtors=top_debtors,
            overdue_30_days=overdue_30,
            overdue_60_days=overdue_60,
            overdue_90_days=overdue_90
        )

    # =====================================================
    # Payment Operations
    # =====================================================

    async def create_payment(
        self, payment: PaymentCreate, user_id: UUID
    ) -> PaymentResponse:
        """Create a payment for a fine."""
        fine = await self.get_fine(payment.fine_id)

        if fine.status in ['paid', 'cancelled']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot pay fine with status: {fine.status}"
            )

        if payment.amount > fine.current_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment amount ({payment.amount}) exceeds outstanding amount ({fine.current_amount})"
            )

        data = payment.dict()
        data['processed_by'] = str(user_id)
        data['payment_status'] = 'completed'
        data['refund_amount'] = 0

        response = self.supabase.table("fine_payments").insert(data).execute()

        if response.data:
            return await self.get_payment(UUID(response.data[0]['id']))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment"
        )

    async def get_payment(self, payment_id: UUID) -> PaymentResponse:
        """Get payment by ID."""
        response = self.supabase.table("fine_payments")\
            .select("*, fines(current_amount, user_id)")\
            .eq("id", str(payment_id))\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )

        payment_data = response.data
        if payment_data.get('fines'):
            payment_data['fine_amount'] = payment_data['fines'].get('current_amount')
            del payment_data['fines']

        return PaymentResponse(**payment_data)

    async def calculate_fine(
        self, request: FineCalculationRequest
    ) -> FineCalculationResponse:
        """Calculate fine amount for a circulation."""
        # Get circulation details
        circ_response = self.supabase.table("circulation")\
            .select("*, users(user_type), books(id, category_id)")\
            .eq("id", str(request.circulation_id))\
            .single()\
            .execute()

        if not circ_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Circulation record not found"
            )

        circ = circ_response.data
        return_date = request.return_date or date.today()
        due_date = date.fromisoformat(circ['due_date']) if circ.get('due_date') else date.today()
        days_overdue = max(0, (return_date - due_date).days)

        if days_overdue == 0:
            return FineCalculationResponse(
                circulation_id=request.circulation_id,
                book_id=circ['book_id'],
                user_id=circ['user_id'],
                days_overdue=0,
                fine_amount=Decimal('0'),
                calculation_details={'message': 'No fine - returned on time'},
                grace_period_applied=0,
                can_assess=False,
                message="No fine applicable"
            )

        # Use database function to calculate fine
        result = self.supabase.rpc(
            'calculate_overdue_fine',
            {'p_circulation_id': str(request.circulation_id), 'p_days_overdue': days_overdue}
        ).execute()

        fine_amount = Decimal(str(result.data)) if result.data else Decimal('0.50') * days_overdue

        return FineCalculationResponse(
            circulation_id=request.circulation_id,
            book_id=circ['book_id'],
            user_id=circ['user_id'],
            days_overdue=days_overdue,
            fine_amount=fine_amount,
            calculation_details={
                'due_date': str(due_date),
                'return_date': str(return_date),
                'days_overdue': days_overdue,
                'calculated_amount': float(fine_amount)
            },
            grace_period_applied=0,
            can_assess=True,
            message=f"Fine of {fine_amount} OMR for {days_overdue} days overdue"
        )
