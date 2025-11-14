"""
Barcode Generation Service

Handles barcode generation for books and book copies
"""
import io
import os
import barcode
from barcode.writer import ImageWriter
from PIL import Image
from typing import Optional, Tuple
import uuid
import random
import string


class BarcodeService:
    """Service for generating and managing barcodes"""

    def __init__(self):
        self.default_format = 'code128'  # Most common library barcode format
        self.ean_format = 'ean13'        # For ISBN-based barcodes

    def generate_barcode_number(self, prefix: str = "LIB") -> str:
        """
        Generate a unique barcode number

        Args:
            prefix: Prefix for the barcode (default: "LIB")

        Returns:
            Unique barcode string
        """
        # Generate timestamp-based unique number
        timestamp = str(uuid.uuid4().int)[:10]
        random_suffix = ''.join(random.choices(string.digits, k=4))

        return f"{prefix}{timestamp}{random_suffix}"

    def generate_barcode_image(
        self,
        barcode_number: str,
        barcode_format: Optional[str] = None,
        include_text: bool = True
    ) -> Tuple[bytes, str]:
        """
        Generate barcode image

        Args:
            barcode_number: The barcode number to encode
            barcode_format: Barcode format (code128, ean13, etc.)
            include_text: Whether to include human-readable text

        Returns:
            Tuple of (image_bytes, content_type)
        """
        try:
            format_to_use = barcode_format or self.default_format

            # Create barcode instance
            barcode_class = barcode.get_barcode_class(format_to_use)
            barcode_instance = barcode_class(
                barcode_number,
                writer=ImageWriter()
            )

            # Generate image in memory
            buffer = io.BytesIO()
            barcode_instance.write(
                buffer,
                options={
                    'write_text': include_text,
                    'text_distance': 5,
                    'module_height': 15,
                    'module_width': 0.4,
                    'font_size': 10,
                    'quiet_zone': 6.5,
                    'foreground': 'black',
                    'background': 'white',
                    'dpi': 300
                }
            )

            # Get image bytes
            buffer.seek(0)
            image_bytes = buffer.getvalue()

            return image_bytes, 'image/png'

        except Exception as e:
            raise ValueError(f"Failed to generate barcode: {str(e)}")

    def generate_isbn_barcode(self, isbn: str) -> Tuple[bytes, str]:
        """
        Generate barcode from ISBN

        Args:
            isbn: ISBN-13 number (13 digits)

        Returns:
            Tuple of (image_bytes, content_type)
        """
        # Clean ISBN (remove hyphens and spaces)
        clean_isbn = ''.join(filter(str.isdigit, isbn))

        if len(clean_isbn) != 13:
            raise ValueError("ISBN must be 13 digits")

        return self.generate_barcode_image(
            clean_isbn,
            barcode_format='ean13',
            include_text=True
        )

    def validate_barcode_number(
        self,
        barcode_number: str,
        barcode_format: Optional[str] = None
    ) -> bool:
        """
        Validate barcode number format

        Args:
            barcode_number: Barcode number to validate
            barcode_format: Expected barcode format

        Returns:
            True if valid, False otherwise
        """
        try:
            format_to_use = barcode_format or self.default_format
            barcode_class = barcode.get_barcode_class(format_to_use)

            # Try to create barcode instance
            barcode_class(barcode_number)
            return True

        except Exception:
            return False

    def generate_qr_code(self, data: str, size: int = 200) -> bytes:
        """
        Generate QR code (requires qrcode library)

        Args:
            data: Data to encode
            size: Size of QR code in pixels

        Returns:
            Image bytes
        """
        try:
            import qrcode
            from qrcode.image.pure import PyPNGImage

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(data)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            # Convert to bytes
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)

            return buffer.getvalue()

        except ImportError:
            raise ImportError("qrcode library not installed. Install with: pip install qrcode[pil]")

    def create_book_label(
        self,
        book_title: str,
        barcode_number: str,
        call_number: Optional[str] = None,
        author: Optional[str] = None
    ) -> bytes:
        """
        Create a printable book spine label with barcode

        Args:
            book_title: Book title
            barcode_number: Barcode number
            call_number: Library call number (e.g., Dewey Decimal)
            author: Book author

        Returns:
            Image bytes for label
        """
        # Generate barcode
        barcode_img_bytes, _ = self.generate_barcode_image(
            barcode_number,
            include_text=True
        )

        # Load barcode image
        barcode_img = Image.open(io.BytesIO(barcode_img_bytes))

        # Create label (standard size: 2x3 inches at 300 DPI)
        label_width = 600  # 2 inches * 300 DPI
        label_height = 900  # 3 inches * 300 DPI

        # Create white background
        label = Image.new('RGB', (label_width, label_height), 'white')

        # Resize barcode to fit label
        barcode_width = int(label_width * 0.9)
        barcode_height = int(barcode_img.height * (barcode_width / barcode_img.width))
        barcode_img = barcode_img.resize((barcode_width, barcode_height), Image.Resampling.LANCZOS)

        # Paste barcode on label
        barcode_x = (label_width - barcode_width) // 2
        barcode_y = label_height - barcode_height - 50
        label.paste(barcode_img, (barcode_x, barcode_y))

        # Add text (title, author, call number)
        from PIL import ImageDraw, ImageFont

        draw = ImageDraw.Draw(label)

        # Try to use a nice font, fall back to default
        try:
            title_font = ImageFont.truetype("arial.ttf", 24)
            info_font = ImageFont.truetype("arial.ttf", 18)
        except:
            title_font = ImageFont.load_default()
            info_font = ImageFont.load_default()

        y_position = 50

        # Draw call number if provided
        if call_number:
            draw.text(
                (label_width // 2, y_position),
                call_number,
                fill='black',
                font=info_font,
                anchor='mt'
            )
            y_position += 40

        # Draw title (wrapped if too long)
        title_lines = self._wrap_text(book_title, 20)
        for line in title_lines[:3]:  # Max 3 lines
            draw.text(
                (label_width // 2, y_position),
                line,
                fill='black',
                font=title_font,
                anchor='mt'
            )
            y_position += 35

        # Draw author if provided
        if author:
            y_position += 20
            draw.text(
                (label_width // 2, y_position),
                f"by {author}",
                fill='gray',
                font=info_font,
                anchor='mt'
            )

        # Convert to bytes
        buffer = io.BytesIO()
        label.save(buffer, format='PNG', dpi=(300, 300))
        buffer.seek(0)

        return buffer.getvalue()

    def _wrap_text(self, text: str, max_length: int) -> list:
        """Wrap text into multiple lines"""
        words = text.split()
        lines = []
        current_line = []

        for word in words:
            test_line = ' '.join(current_line + [word])
            if len(test_line) <= max_length:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]

        if current_line:
            lines.append(' '.join(current_line))

        return lines


# Singleton instance
_barcode_service = None


def get_barcode_service() -> BarcodeService:
    """Get barcode service singleton instance"""
    global _barcode_service
    if _barcode_service is None:
        _barcode_service = BarcodeService()
    return _barcode_service
