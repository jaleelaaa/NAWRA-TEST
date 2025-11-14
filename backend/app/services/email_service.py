"""
Email Notification Service

Handles email sending for various library events
"""
import resend
from typing import Optional, List, Dict, Any
from jinja2 import Template
from datetime import datetime, date
from app.core.config import get_settings

settings = get_settings()


class EmailService:
    """Service for sending email notifications"""

    def __init__(self):
        # Initialize Resend with API key
        resend.api_key = settings.RESEND_API_KEY
        self.from_email = settings.EMAIL_FROM

    async def send_email(
        self,
        to: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email

        Args:
            to: Recipient email address
            subject: Email subject
            html_content: HTML email content
            text_content: Plain text content (optional)

        Returns:
            True if sent successfully, False otherwise
        """
        try:
            params = {
                "from": self.from_email,
                "to": [to],
                "subject": subject,
                "html": html_content,
            }

            if text_content:
                params["text"] = text_content

            response = resend.Emails.send(params)
            return True

        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    async def send_overdue_notification(
        self,
        user_email: str,
        user_name: str,
        book_title: str,
        due_date: date,
        days_overdue: int,
        fine_amount: float,
        locale: str = "en"
    ) -> bool:
        """
        Send overdue book notification

        Args:
            user_email: User's email address
            user_name: User's full name
            book_title: Title of the overdue book
            due_date: Original due date
            days_overdue: Number of days overdue
            fine_amount: Current fine amount
            locale: Language locale (en or ar)

        Returns:
            True if sent successfully
        """
        if locale == "ar":
            subject = f"تذكير: كتاب متأخر - {book_title}"
            template = self._get_overdue_template_ar()
        else:
            subject = f"Reminder: Overdue Book - {book_title}"
            template = self._get_overdue_template_en()

        html_content = template.render(
            user_name=user_name,
            book_title=book_title,
            due_date=due_date.strftime("%Y-%m-%d"),
            days_overdue=days_overdue,
            fine_amount=f"{fine_amount:.2f}",
            current_date=datetime.now().strftime("%Y-%m-%d")
        )

        return await self.send_email(user_email, subject, html_content)

    async def send_due_soon_notification(
        self,
        user_email: str,
        user_name: str,
        book_title: str,
        due_date: date,
        days_until_due: int,
        locale: str = "en"
    ) -> bool:
        """
        Send due soon notification

        Args:
            user_email: User's email address
            user_name: User's full name
            book_title: Title of the book
            due_date: Due date
            days_until_due: Days until due
            locale: Language locale

        Returns:
            True if sent successfully
        """
        if locale == "ar":
            subject = f"تذكير: كتاب مستحق قريباً - {book_title}"
            template = self._get_due_soon_template_ar()
        else:
            subject = f"Reminder: Book Due Soon - {book_title}"
            template = self._get_due_soon_template_en()

        html_content = template.render(
            user_name=user_name,
            book_title=book_title,
            due_date=due_date.strftime("%Y-%m-%d"),
            days_until_due=days_until_due
        )

        return await self.send_email(user_email, subject, html_content)

    async def send_reservation_ready_notification(
        self,
        user_email: str,
        user_name: str,
        book_title: str,
        pickup_location: str,
        expiry_date: date,
        locale: str = "en"
    ) -> bool:
        """
        Send reservation ready notification

        Args:
            user_email: User's email address
            user_name: User's full name
            book_title: Title of the reserved book
            pickup_location: Where to pick up the book
            expiry_date: Reservation expiry date
            locale: Language locale

        Returns:
            True if sent successfully
        """
        if locale == "ar":
            subject = f"حجزك جاهز - {book_title}"
            template = self._get_reservation_ready_template_ar()
        else:
            subject = f"Your Reservation is Ready - {book_title}"
            template = self._get_reservation_ready_template_en()

        html_content = template.render(
            user_name=user_name,
            book_title=book_title,
            pickup_location=pickup_location,
            expiry_date=expiry_date.strftime("%Y-%m-%d")
        )

        return await self.send_email(user_email, subject, html_content)

    async def send_welcome_email(
        self,
        user_email: str,
        user_name: str,
        temporary_password: Optional[str] = None,
        locale: str = "en"
    ) -> bool:
        """
        Send welcome email to new users

        Args:
            user_email: User's email address
            user_name: User's full name
            temporary_password: Temporary password (if generated)
            locale: Language locale

        Returns:
            True if sent successfully
        """
        if locale == "ar":
            subject = "مرحباً بك في نظام نَوْرَة"
            template = self._get_welcome_template_ar()
        else:
            subject = "Welcome to NAWRA Library System"
            template = self._get_welcome_template_en()

        html_content = template.render(
            user_name=user_name,
            email=user_email,
            temporary_password=temporary_password
        )

        return await self.send_email(user_email, subject, html_content)

    async def send_password_reset_email(
        self,
        user_email: str,
        user_name: str,
        reset_token: str,
        locale: str = "en"
    ) -> bool:
        """
        Send password reset email

        Args:
            user_email: User's email address
            user_name: User's full name
            reset_token: Password reset token
            locale: Language locale

        Returns:
            True if sent successfully
        """
        reset_url = f"{settings.FRONTEND_URL}/{locale}/reset-password?token={reset_token}"

        if locale == "ar":
            subject = "إعادة تعيين كلمة المرور"
            template = self._get_password_reset_template_ar()
        else:
            subject = "Password Reset Request"
            template = self._get_password_reset_template_en()

        html_content = template.render(
            user_name=user_name,
            reset_url=reset_url
        )

        return await self.send_email(user_email, subject, html_content)

    # =================================================================
    # Email Templates - English
    # =================================================================

    def _get_overdue_template_en(self) -> Template:
        """Get English overdue email template"""
        return Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Overdue Book Notice</h1>
        </div>
        <div class="content">
            <p>Dear {{ user_name }},</p>
            <p>This is a reminder that the following book is overdue:</p>
            <div class="alert">
                <strong>Book:</strong> {{ book_title }}<br>
                <strong>Due Date:</strong> {{ due_date }}<br>
                <strong>Days Overdue:</strong> {{ days_overdue }}<br>
                <strong>Fine Amount:</strong> {{ fine_amount }} OMR
            </div>
            <p>Please return the book as soon as possible to avoid additional fines.</p>
            <p>You can renew the book online if eligible, or visit the library to return it.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="#" class="button">View My Loans</a>
            </p>
        </div>
        <div class="footer">
            <p>NAWRA Library Management System</p>
            <p>Ministry of Education, Sultanate of Oman</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_due_soon_template_en(self) -> Template:
        """Get English due soon email template"""
        return Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .info { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 10px; margin: 15px 0; }
        .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📖 Book Due Soon</h1>
        </div>
        <div class="content">
            <p>Dear {{ user_name }},</p>
            <p>This is a friendly reminder that the following book is due soon:</p>
            <div class="info">
                <strong>Book:</strong> {{ book_title }}<br>
                <strong>Due Date:</strong> {{ due_date }}<br>
                <strong>Days Until Due:</strong> {{ days_until_due }}
            </div>
            <p>Please return the book by the due date or renew it online to avoid fines.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="#" class="button">Renew Book</a>
            </p>
        </div>
        <div class="footer">
            <p>NAWRA Library Management System</p>
            <p>Ministry of Education, Sultanate of Oman</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_reservation_ready_template_en(self) -> Template:
        """Get English reservation ready email template"""
        return Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .success { background-color: #d4edda; border-left: 4px solid #28a745; padding: 10px; margin: 15px 0; }
        .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Your Reservation is Ready!</h1>
        </div>
        <div class="content">
            <p>Dear {{ user_name }},</p>
            <p>Great news! The book you reserved is now available for pickup:</p>
            <div class="success">
                <strong>Book:</strong> {{ book_title }}<br>
                <strong>Pickup Location:</strong> {{ pickup_location }}<br>
                <strong>Hold Until:</strong> {{ expiry_date }}
            </div>
            <p>Please pick up your book before the hold expiry date. The reservation will be cancelled if not picked up on time.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="#" class="button">View Reservations</a>
            </p>
        </div>
        <div class="footer">
            <p>NAWRA Library Management System</p>
            <p>Ministry of Education, Sultanate of Oman</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_welcome_template_en(self) -> Template:
        """Get English welcome email template"""
        return Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .credentials { background-color: #e8f4f8; border: 1px solid #3498db; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to NAWRA!</h1>
        </div>
        <div class="content">
            <p>Dear {{ user_name }},</p>
            <p>Welcome to the NAWRA Library Management System! Your account has been created successfully.</p>
            {% if temporary_password %}
            <div class="credentials">
                <strong>Your Login Credentials:</strong><br>
                <strong>Email:</strong> {{ email }}<br>
                <strong>Temporary Password:</strong> {{ temporary_password }}<br><br>
                <em>Please change your password after first login for security.</em>
            </div>
            {% endif %}
            <p>You can now:</p>
            <ul>
                <li>Browse our complete book collection</li>
                <li>Reserve books online</li>
                <li>Renew your borrowed books</li>
                <li>Track your borrowing history</li>
                <li>Manage your account settings</li>
            </ul>
            <p style="text-align: center;">
                <a href="#" class="button">Login to Your Account</a>
            </p>
        </div>
        <div class="footer">
            <p>NAWRA Library Management System</p>
            <p>Ministry of Education, Sultanate of Oman</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_password_reset_template_en(self) -> Template:
        """Get English password reset email template"""
        return Template("""
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #9b59b6; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .button { background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Dear {{ user_name }},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">Reset Password</a>
            </p>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3498db;">{{ reset_url }}</p>
        </div>
        <div class="footer">
            <p>NAWRA Library Management System</p>
            <p>Ministry of Education, Sultanate of Oman</p>
        </div>
    </div>
</body>
</html>
        """)

    # =================================================================
    # Email Templates - Arabic (RTL)
    # =================================================================

    def _get_overdue_template_ar(self) -> Template:
        """Get Arabic overdue email template"""
        return Template("""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <style>
        body { font-family: 'Arial', 'Tahoma', sans-serif; line-height: 1.8; color: #333; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .alert { background-color: #fff3cd; border-right: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 إشعار كتاب متأخر</h1>
        </div>
        <div class="content">
            <p>عزيزي {{ user_name }}،</p>
            <p>هذا تذكير بأن الكتاب التالي متأخر:</p>
            <div class="alert">
                <strong>الكتاب:</strong> {{ book_title }}<br>
                <strong>تاريخ الاستحقاق:</strong> {{ due_date }}<br>
                <strong>أيام التأخير:</strong> {{ days_overdue }}<br>
                <strong>قيمة الغرامة:</strong> {{ fine_amount }} ريال عماني
            </div>
            <p>يرجى إرجاع الكتاب في أقرب وقت ممكن لتجنب غرامات إضافية.</p>
            <p>يمكنك تجديد الكتاب عبر الإنترنت إذا كنت مؤهلاً، أو زيارة المكتبة لإرجاعه.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="#" class="button">عرض استعاراتي</a>
            </p>
        </div>
        <div class="footer">
            <p>نظام نَوْرَة لإدارة المكتبات</p>
            <p>وزارة التربية والتعليم، سلطنة عُمان</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_due_soon_template_ar(self) -> Template:
        """Get Arabic due soon email template"""
        return Template("""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <style>
        body { font-family: 'Arial', 'Tahoma', sans-serif; line-height: 1.8; color: #333; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .info { background-color: #d1ecf1; border-right: 4px solid #17a2b8; padding: 10px; margin: 15px 0; }
        .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📖 كتاب مستحق قريباً</h1>
        </div>
        <div class="content">
            <p>عزيزي {{ user_name }}،</p>
            <p>هذا تذكير ودي بأن الكتاب التالي مستحق قريباً:</p>
            <div class="info">
                <strong>الكتاب:</strong> {{ book_title }}<br>
                <strong>تاريخ الاستحقاق:</strong> {{ due_date }}<br>
                <strong>أيام حتى الاستحقاق:</strong> {{ days_until_due }}
            </div>
            <p>يرجى إرجاع الكتاب بحلول تاريخ الاستحقاق أو تجديده عبر الإنترنت لتجنب الغرامات.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="#" class="button">تجديد الكتاب</a>
            </p>
        </div>
        <div class="footer">
            <p>نظام نَوْرَة لإدارة المكتبات</p>
            <p>وزارة التربية والتعليم، سلطنة عُمان</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_reservation_ready_template_ar(self) -> Template:
        """Get Arabic reservation ready email template"""
        return Template("""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <style>
        body { font-family: 'Arial', 'Tahoma', sans-serif; line-height: 1.8; color: #333; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .success { background-color: #d4edda; border-right: 4px solid #28a745; padding: 10px; margin: 15px 0; }
        .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ حجزك جاهز!</h1>
        </div>
        <div class="content">
            <p>عزيزي {{ user_name }}،</p>
            <p>أخبار رائعة! الكتاب الذي حجزته متاح الآن للاستلام:</p>
            <div class="success">
                <strong>الكتاب:</strong> {{ book_title }}<br>
                <strong>موقع الاستلام:</strong> {{ pickup_location }}<br>
                <strong>صالح حتى:</strong> {{ expiry_date }}
            </div>
            <p>يرجى استلام كتابك قبل تاريخ انتهاء الحجز. سيتم إلغاء الحجز إذا لم يتم الاستلام في الوقت المحدد.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="#" class="button">عرض الحجوزات</a>
            </p>
        </div>
        <div class="footer">
            <p>نظام نَوْرَة لإدارة المكتبات</p>
            <p>وزارة التربية والتعليم، سلطنة عُمان</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_welcome_template_ar(self) -> Template:
        """Get Arabic welcome email template"""
        return Template("""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <style>
        body { font-family: 'Arial', 'Tahoma', sans-serif; line-height: 1.8; color: #333; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .credentials { background-color: #e8f4f8; border: 1px solid #3498db; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .button { background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 مرحباً بك في نَوْرَة!</h1>
        </div>
        <div class="content">
            <p>عزيزي {{ user_name }}،</p>
            <p>مرحباً بك في نظام نَوْرَة لإدارة المكتبات! تم إنشاء حسابك بنجاح.</p>
            {% if temporary_password %}
            <div class="credentials">
                <strong>بيانات تسجيل الدخول:</strong><br>
                <strong>البريد الإلكتروني:</strong> {{ email }}<br>
                <strong>كلمة المرور المؤقتة:</strong> {{ temporary_password }}<br><br>
                <em>يرجى تغيير كلمة المرور بعد أول تسجيل دخول للأمان.</em>
            </div>
            {% endif %}
            <p>يمكنك الآن:</p>
            <ul>
                <li>تصفح مجموعة الكتب الكاملة</li>
                <li>حجز الكتب عبر الإنترنت</li>
                <li>تجديد الكتب المستعارة</li>
                <li>تتبع سجل الاستعارة</li>
                <li>إدارة إعدادات حسابك</li>
            </ul>
            <p style="text-align: center;">
                <a href="#" class="button">تسجيل الدخول إلى حسابك</a>
            </p>
        </div>
        <div class="footer">
            <p>نظام نَوْرَة لإدارة المكتبات</p>
            <p>وزارة التربية والتعليم، سلطنة عُمان</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_password_reset_template_ar(self) -> Template:
        """Get Arabic password reset email template"""
        return Template("""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <style>
        body { font-family: 'Arial', 'Tahoma', sans-serif; line-height: 1.8; color: #333; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #9b59b6; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { background-color: #34495e; color: white; padding: 10px; text-align: center; font-size: 12px; }
        .button { background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border-right: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 طلب إعادة تعيين كلمة المرور</h1>
        </div>
        <div class="content">
            <p>عزيزي {{ user_name }}،</p>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">إعادة تعيين كلمة المرور</a>
            </p>
            <div class="warning">
                <strong>⚠️ تنبيه أمني:</strong><br>
                سينتهي صلاحية هذا الرابط في ساعة واحدة. إذا لم تطلب إعادة التعيين، يرجى تجاهل هذا البريد.
            </div>
            <p>إذا لم يعمل الزر، انسخ والصق هذا الرابط في متصفحك:</p>
            <p style="word-break: break-all; color: #3498db;">{{ reset_url }}</p>
        </div>
        <div class="footer">
            <p>نظام نَوْرَة لإدارة المكتبات</p>
            <p>وزارة التربية والتعليم، سلطنة عُمان</p>
        </div>
    </div>
</body>
</html>
        """)


# Singleton instance
_email_service = None


def get_email_service() -> EmailService:
    """Get email service singleton instance"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
