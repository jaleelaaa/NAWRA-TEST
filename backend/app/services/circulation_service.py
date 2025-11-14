"""
Circulation service - Business logic for circulation management
"""
from typing import Optional, Dict, List
from datetime import datetime, date, timedelta
from uuid import UUID
from ..db import get_supabase
import math


class CirculationService:
    """Circulation service for book issue/return operations"""

    # Fine configuration
    FINE_PER_DAY = 0.5  # OMR per day
    MAX_FINE = 50.0  # Maximum fine in OMR

    def __init__(self):
        self.supabase = get_supabase()

    def _calculate_days_left(self, due_date_str: str) -> int:
        """Calculate days left until due date"""
        try:
            if isinstance(due_date_str, str):
                due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
            else:
                due_date = due_date_str

            today = date.today()
            delta = (due_date - today).days
            return delta
        except Exception:
            return 0

    def _calculate_fine(self, due_date_str: str, return_date: Optional[date] = None) -> float:
        """Calculate fine amount for overdue books"""
        try:
            if isinstance(due_date_str, str):
                due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00')).date()
            else:
                due_date = due_date_str

            check_date = return_date if return_date else date.today()

            if check_date <= due_date:
                return 0.0

            overdue_days = (check_date - due_date).days
            fine = overdue_days * self.FINE_PER_DAY
            return min(fine, self.MAX_FINE)
        except Exception:
            return 0.0

    def _determine_status(self, due_date_str: str, return_date: Optional[str]) -> str:
        """Determine circulation status"""
        if return_date:
            return "returned"

        days_left = self._calculate_days_left(due_date_str)
        if days_left < 0:
            return "overdue"
        return "active"

    async def get_circulation_records(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
        user_type: Optional[str] = None,
        due_date_filter: Optional[str] = None,
        sort_by: str = "issue_date",
        sort_order: str = "desc"
    ) -> Dict:
        """
        Get paginated list of circulation records with filtering and sorting
        """
        try:
            # Build query with joins
            query = self.supabase.table('circulation_records').select(
                """
                id, user_id, book_id, issue_date, due_date, return_date,
                book_condition, fine_amount, fine_paid, notes, created_at, updated_at,
                users(id, full_name, user_type, roles(name)),
                books(id, title, isbn, category, shelf_location)
                """,
                count="exact"
            )

            # Apply search filter (user name or book title)
            if search:
                # Note: Supabase doesn't support nested OR searches easily
                # We'll need to filter in memory for complex searches
                pass

            # Apply due date filter
            if due_date_filter:
                today = date.today()
                if due_date_filter == "today":
                    query = query.eq('due_date', today.isoformat())
                elif due_date_filter == "tomorrow":
                    tomorrow = today + timedelta(days=1)
                    query = query.eq('due_date', tomorrow.isoformat())
                elif due_date_filter == "week":
                    week_end = today + timedelta(days=7)
                    query = query.gte('due_date', today.isoformat()).lte('due_date', week_end.isoformat())
                elif due_date_filter == "overdue":
                    query = query.lt('due_date', today.isoformat()).is_('return_date', 'null')

            # Filter out returned books if status is not "returned"
            if status and status != "returned":
                query = query.is_('return_date', 'null')

            # Apply sorting
            ascending = sort_order.lower() == "asc"
            query = query.order(sort_by, desc=not ascending)

            # Apply pagination
            start = (page - 1) * page_size
            end = start + page_size - 1
            query = query.range(start, end)

            # Execute query
            response = query.execute()

            # Get total count
            total = response.count if hasattr(response, 'count') else len(response.data)

            # Transform data
            records = []
            for record in response.data:
                user = record.get('users', {})
                book = record.get('books', {})

                # Calculate days left and status
                days_left = self._calculate_days_left(record['due_date'])
                calculated_status = self._determine_status(record['due_date'], record.get('return_date'))

                # Apply status filter
                if status and calculated_status != status:
                    continue

                # Apply user type filter
                if user_type and user.get('user_type') != user_type:
                    continue

                # Apply search filter (in memory)
                if search:
                    search_lower = search.lower()
                    if not (
                        search_lower in user.get('full_name', '').lower() or
                        search_lower in book.get('title', '').lower()
                    ):
                        continue

                # Calculate fine if overdue
                fine_amount = record.get('fine_amount')
                if fine_amount is None and calculated_status == 'overdue':
                    fine_amount = self._calculate_fine(record['due_date'])

                records.append({
                    'id': record['id'],
                    'user_id': record['user_id'],
                    'user_name': user.get('full_name', 'Unknown'),
                    'user_role': user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron',
                    'book_id': record['book_id'],
                    'book_title': book.get('title', 'Unknown'),
                    'book_isbn': book.get('isbn'),
                    'category': book.get('category'),
                    'shelf_location': book.get('shelf_location'),
                    'issue_date': record['issue_date'],
                    'due_date': record['due_date'],
                    'return_date': record.get('return_date'),
                    'status': calculated_status,
                    'book_condition': record.get('book_condition'),
                    'fine_amount': fine_amount,
                    'fine_paid': record.get('fine_paid', False),
                    'days_left': days_left,
                    'notes': record.get('notes'),
                    'created_at': record['created_at'],
                    'updated_at': record['updated_at']
                })

            # Calculate pagination
            actual_total = len(records)
            total_pages = math.ceil(actual_total / page_size) if actual_total > 0 else 0

            return {
                'items': records,
                'total': actual_total,
                'page': page,
                'page_size': page_size,
                'total_pages': total_pages
            }

        except Exception as e:
            print(f"Error fetching circulation records: {str(e)}")
            raise Exception(f"Failed to fetch circulation records: {str(e)}")

    async def get_circulation_record(self, record_id: str) -> Optional[Dict]:
        """
        Get single circulation record by ID
        """
        try:
            response = self.supabase.table('circulation_records').select(
                """
                id, user_id, book_id, issue_date, due_date, return_date,
                book_condition, fine_amount, fine_paid, notes, created_at, updated_at,
                users(id, full_name, email, phone, user_type, roles(name)),
                books(id, title, isbn, author, publisher, publication_year, category, shelf_location)
                """
            ).eq('id', record_id).single().execute()

            if not response.data:
                return None

            record = response.data
            user = record.get('users', {})
            book = record.get('books', {})

            days_left = self._calculate_days_left(record['due_date'])
            status = self._determine_status(record['due_date'], record.get('return_date'))

            fine_amount = record.get('fine_amount')
            if fine_amount is None and status == 'overdue':
                fine_amount = self._calculate_fine(record['due_date'])

            return {
                'id': record['id'],
                'user_id': record['user_id'],
                'user_name': user.get('full_name', 'Unknown'),
                'user_email': user.get('email'),
                'user_phone': user.get('phone'),
                'user_role': user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron',
                'book_id': record['book_id'],
                'book_title': book.get('title', 'Unknown'),
                'book_isbn': book.get('isbn'),
                'book_author': book.get('author'),
                'book_publisher': book.get('publisher'),
                'book_year': book.get('publication_year'),
                'category': book.get('category'),
                'shelf_location': book.get('shelf_location'),
                'issue_date': record['issue_date'],
                'due_date': record['due_date'],
                'return_date': record.get('return_date'),
                'status': status,
                'book_condition': record.get('book_condition'),
                'fine_amount': fine_amount,
                'fine_paid': record.get('fine_paid', False),
                'days_left': days_left,
                'notes': record.get('notes'),
                'created_at': record['created_at'],
                'updated_at': record['updated_at']
            }

        except Exception as e:
            print(f"Error fetching circulation record: {str(e)}")
            return None

    async def issue_book(self, circulation_data: Dict) -> Dict:
        """
        Issue a book to a user
        """
        try:
            # Prepare circulation record
            new_record = {
                'user_id': str(circulation_data['user_id']),
                'book_id': str(circulation_data['book_id']),
                'issue_date': circulation_data['issue_date'].isoformat() if isinstance(circulation_data['issue_date'], date) else circulation_data['issue_date'],
                'due_date': circulation_data['due_date'].isoformat() if isinstance(circulation_data['due_date'], date) else circulation_data['due_date'],
                'notes': circulation_data.get('notes'),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }

            # Insert circulation record
            response = self.supabase.table('circulation_records').insert(new_record).execute()

            if not response.data:
                raise Exception("Failed to issue book")

            # TODO: Send email notification if requested
            # TODO: Update book status to "borrowed"

            # Fetch created record
            return await self.get_circulation_record(response.data[0]['id'])

        except Exception as e:
            print(f"Error issuing book: {str(e)}")
            raise Exception(f"Failed to issue book: {str(e)}")

    async def return_book(self, record_id: str, return_data: Dict) -> Dict:
        """
        Process book return
        """
        try:
            # Get existing record
            existing = await self.get_circulation_record(record_id)
            if not existing:
                raise Exception("Circulation record not found")

            # Calculate fine if overdue
            return_date_val = return_data['return_date']
            if isinstance(return_date_val, str):
                return_date_val = datetime.fromisoformat(return_date_val).date()

            fine_amount = self._calculate_fine(existing['due_date'], return_date_val)

            # Prepare update data
            update_data = {
                'return_date': return_date_val.isoformat(),
                'book_condition': return_data['book_condition'],
                'fine_amount': fine_amount,
                'fine_paid': False,
                'notes': return_data.get('notes', existing.get('notes')),
                'updated_at': datetime.utcnow().isoformat()
            }

            # Update circulation record
            response = self.supabase.table('circulation_records').update(update_data).eq('id', record_id).execute()

            if not response.data:
                raise Exception("Failed to process return")

            # TODO: Update book status to "available" or "damaged" based on condition

            # Fetch updated record
            return await self.get_circulation_record(record_id)

        except Exception as e:
            print(f"Error processing return: {str(e)}")
            raise Exception(f"Failed to process return: {str(e)}")

    async def update_circulation_record(self, record_id: str, update_data: Dict) -> Dict:
        """
        Update circulation record
        """
        try:
            # Prepare update data
            data = {'updated_at': datetime.utcnow().isoformat()}

            if 'due_date' in update_data:
                data['due_date'] = update_data['due_date'].isoformat() if isinstance(update_data['due_date'], date) else update_data['due_date']
            if 'return_date' in update_data:
                data['return_date'] = update_data['return_date'].isoformat() if isinstance(update_data['return_date'], date) else update_data['return_date']
            if 'book_condition' in update_data:
                data['book_condition'] = update_data['book_condition']
            if 'fine_amount' in update_data:
                data['fine_amount'] = update_data['fine_amount']
            if 'fine_paid' in update_data:
                data['fine_paid'] = update_data['fine_paid']
            if 'notes' in update_data:
                data['notes'] = update_data['notes']

            # Update record
            response = self.supabase.table('circulation_records').update(data).eq('id', record_id).execute()

            if not response.data:
                raise Exception("Circulation record not found or update failed")

            # Fetch updated record
            return await self.get_circulation_record(record_id)

        except Exception as e:
            print(f"Error updating circulation record: {str(e)}")
            raise Exception(f"Failed to update circulation record: {str(e)}")

    async def delete_circulation_record(self, record_id: str) -> bool:
        """
        Delete circulation record
        """
        try:
            response = self.supabase.table('circulation_records').delete().eq('id', record_id).execute()
            return True

        except Exception as e:
            print(f"Error deleting circulation record: {str(e)}")
            raise Exception(f"Failed to delete circulation record: {str(e)}")

    async def get_circulation_stats(self) -> Dict:
        """
        Get circulation statistics
        """
        try:
            # Get all circulation records
            all_records = self.supabase.table('circulation_records').select(
                """
                id, issue_date, due_date, return_date, fine_amount, fine_paid,
                users(id, full_name),
                books(id, title)
                """
            ).execute()

            records = all_records.data
            today = date.today()

            # Calculate stats
            active_issues = 0
            overdue_books = 0
            returned_today = 0
            reserved_books = 0  # TODO: Implement reservations
            total_fines = 0.0
            total_fines_paid = 0.0

            for record in records:
                if record.get('return_date'):
                    # Check if returned today
                    return_date = datetime.fromisoformat(record['return_date'].replace('Z', '+00:00')).date()
                    if return_date == today:
                        returned_today += 1
                else:
                    # Active or overdue
                    days_left = self._calculate_days_left(record['due_date'])
                    if days_left < 0:
                        overdue_books += 1
                    else:
                        active_issues += 1

                # Sum fines
                fine = record.get('fine_amount', 0) or 0
                total_fines += fine
                if record.get('fine_paid'):
                    total_fines_paid += fine

            # Calculate average borrow duration
            completed_borrows = [r for r in records if r.get('return_date')]
            if completed_borrows:
                total_days = 0
                for record in completed_borrows:
                    issue = datetime.fromisoformat(record['issue_date'].replace('Z', '+00:00')).date()
                    ret = datetime.fromisoformat(record['return_date'].replace('Z', '+00:00')).date()
                    total_days += (ret - issue).days
                average_duration = total_days / len(completed_borrows)
            else:
                average_duration = 0.0

            # Most borrowed books
            book_counts = {}
            for record in records:
                book = record.get('books', {})
                book_id = book.get('id')
                if book_id:
                    if book_id not in book_counts:
                        book_counts[book_id] = {'title': book.get('title', 'Unknown'), 'count': 0}
                    book_counts[book_id]['count'] += 1

            most_borrowed = sorted(
                [{'book_id': k, 'title': v['title'], 'count': v['count']} for k, v in book_counts.items()],
                key=lambda x: x['count'],
                reverse=True
            )[:5]

            # Most active users
            user_counts = {}
            for record in records:
                user = record.get('users', {})
                user_id = user.get('id')
                if user_id:
                    if user_id not in user_counts:
                        user_counts[user_id] = {'name': user.get('full_name', 'Unknown'), 'count': 0}
                    user_counts[user_id]['count'] += 1

            most_active = sorted(
                [{'user_id': k, 'name': v['name'], 'count': v['count']} for k, v in user_counts.items()],
                key=lambda x: x['count'],
                reverse=True
            )[:5]

            return {
                'active_issues': active_issues,
                'overdue_books': overdue_books,
                'returned_today': returned_today,
                'reserved_books': reserved_books,
                'total_fines': total_fines,
                'total_fines_paid': total_fines_paid,
                'average_borrow_duration': average_duration,
                'most_borrowed_books': most_borrowed,
                'most_active_users': most_active
            }

        except Exception as e:
            print(f"Error getting circulation stats: {str(e)}")
            raise Exception(f"Failed to get circulation stats: {str(e)}")
