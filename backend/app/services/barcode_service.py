"""
Barcode Generation Service

Handles barcode generation for library books and artifacts
"""

import io
import os
import barcode
from barcode.writer import ImageWriter, SVGWriter
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from typing import Optional, Tuple
import uuid
from datetime import datetime


class BarcodeService:
    """Service for generating and managing barcodes"""

    # Supported barcode types
    BARCODE_TYPES = {
        'code128': barcode.Code128,
        'ean13': barcode.EAN13,
        'ean8': barcode.EAN8,
        'upc': barcode.UPCA,
    }

    # Default barcode format
    DEFAULT_FORMAT = 'code128'

    # Barcode prefix for library items
    LIBRARY_PREFIX = 'LIB'

    def __init__(self):
        self.upload_dir = 'uploads/barcodes'
        self._ensure_upload_dir()

    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        os.makedirs(self.upload_dir, exist_ok=True)

    def generate_barcode_number(self, book_id: str) -> str:
        """
        Generate unique barcode number for a book

        Format: LIB + 8-digit hash of book_id
        Example: LIB12345678
        """
        # Create a hash from UUID to get numeric value
        hash_value = abs(hash(book_id)) % 100000000
        barcode_number = f"{self.LIBRARY_PREFIX}{hash_value:08d}"
        return barcode_number

    def generate_barcode_image(
        self,
        barcode_number: str,
        barcode_type: str = DEFAULT_FORMAT,
        include_text: bool = True,
        width: Optional[int] = None,
        height: Optional[int] = None
    ) -> bytes:
        """
        Generate barcode as PNG image

        Args:
            barcode_number: The number to encode in barcode
            barcode_type: Type of barcode (code128, ean13, etc.)
            include_text: Whether to include text below barcode
            width: Optional custom width in pixels
            height: Optional custom height in pixels

        Returns:
            PNG image as bytes
        """
        # Get barcode class
        barcode_class = self.BARCODE_TYPES.get(barcode_type, barcode.Code128)

        # Create writer with options
        writer_options = {
            'module_width': 0.3,
            'module_height': 15,
            'quiet_zone': 6.5,
            'font_size': 10 if include_text else 0,
            'text_distance': 5,
            'background': 'white',
            'foreground': 'black',
        }

        if width:
            writer_options['module_width'] = width / 100
        if height:
            writer_options['module_height'] = height

        writer = ImageWriter()
        writer.set_options(writer_options)

        # Generate barcode
        barcode_instance = barcode_class(barcode_number, writer=writer)

        # Save to byte stream
        buffer = io.BytesIO()
        barcode_instance.write(buffer)
        buffer.seek(0)

        return buffer.getvalue()

    def generate_barcode_svg(
        self,
        barcode_number: str,
        barcode_type: str = DEFAULT_FORMAT,
        include_text: bool = True
    ) -> str:
        """
        Generate barcode as SVG

        Args:
            barcode_number: The number to encode in barcode
            barcode_type: Type of barcode
            include_text: Whether to include text below barcode

        Returns:
            SVG XML as string
        """
        # Get barcode class
        barcode_class = self.BARCODE_TYPES.get(barcode_type, barcode.Code128)

        # Create writer
        writer_options = {
            'module_width': 0.3,
            'module_height': 15,
            'quiet_zone': 6.5,
            'font_size': 10 if include_text else 0,
            'text_distance': 5,
        }

        writer = SVGWriter()
        writer.set_options(writer_options)

        # Generate barcode
        barcode_instance = barcode_class(barcode_number, writer=writer)

        # Save to byte stream
        buffer = io.BytesIO()
        barcode_instance.write(buffer)
        buffer.seek(0)

        return buffer.getvalue().decode('utf-8')

    def generate_label_pdf(
        self,
        barcode_number: str,
        title: str,
        author: str,
        category: str,
        shelf_location: str,
        barcode_type: str = DEFAULT_FORMAT
    ) -> bytes:
        """
        Generate a printable label with barcode and book information

        Args:
            barcode_number: The barcode number
            title: Book title
            author: Book author
            category: Book category
            shelf_location: Shelf location
            barcode_type: Type of barcode

        Returns:
            PDF as bytes
        """
        # Create PDF buffer
        buffer = io.BytesIO()

        # Create canvas (label size: 100mm x 50mm)
        pdf = canvas.Canvas(buffer, pagesize=(100*mm, 50*mm))

        # Add title (truncate if too long)
        title_truncated = title[:40] + '...' if len(title) > 40 else title
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(5*mm, 45*mm, title_truncated)

        # Add author
        pdf.setFont("Helvetica", 8)
        pdf.drawString(5*mm, 41*mm, f"Author: {author[:30]}")

        # Add category and location
        pdf.drawString(5*mm, 38*mm, f"Category: {category}")
        pdf.drawString(5*mm, 35*mm, f"Location: {shelf_location}")

        # Generate barcode image
        barcode_image_bytes = self.generate_barcode_image(
            barcode_number,
            barcode_type,
            include_text=True,
            width=300,
            height=10
        )

        # Save barcode temporarily
        barcode_path = os.path.join(self.upload_dir, f"temp_{uuid.uuid4()}.png")
        with open(barcode_path, 'wb') as f:
            f.write(barcode_image_bytes)

        # Add barcode to PDF
        pdf.drawImage(barcode_path, 5*mm, 10*mm, width=90*mm, height=20*mm, preserveAspectRatio=True)

        # Save PDF
        pdf.save()

        # Clean up temp barcode
        if os.path.exists(barcode_path):
            os.remove(barcode_path)

        buffer.seek(0)
        return buffer.getvalue()

    def generate_bulk_labels_pdf(
        self,
        books: list,
        barcode_type: str = DEFAULT_FORMAT
    ) -> bytes:
        """
        Generate multiple labels in a single PDF (for bulk printing)

        Args:
            books: List of book dictionaries with barcode_number, title, author, category, shelf_location
            barcode_type: Type of barcode

        Returns:
            PDF with multiple labels
        """
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)

        # Label dimensions and layout
        label_width = 100 * mm
        label_height = 50 * mm
        labels_per_row = 2
        labels_per_column = 5
        margin_x = 10 * mm
        margin_y = 10 * mm

        x_positions = [margin_x, margin_x + label_width + 10*mm]
        y_positions = [letter[1] - margin_y - (i+1)*label_height - i*5*mm for i in range(labels_per_column)]

        book_index = 0
        for book in books:
            row = book_index % labels_per_column
            col = (book_index // labels_per_column) % labels_per_row

            # Start new page if needed
            if book_index > 0 and book_index % (labels_per_row * labels_per_column) == 0:
                pdf.showPage()

            x = x_positions[col]
            y = y_positions[row]

            # Add book info to label
            pdf.setFont("Helvetica-Bold", 9)
            title_truncated = book['title'][:35] + '...' if len(book['title']) > 35 else book['title']
            pdf.drawString(x + 2*mm, y + label_height - 5*mm, title_truncated)

            pdf.setFont("Helvetica", 7)
            pdf.drawString(x + 2*mm, y + label_height - 9*mm, f"Author: {book.get('author', '')[:25]}")
            pdf.drawString(x + 2*mm, y + label_height - 12*mm, f"Category: {book.get('category', '')}")
            pdf.drawString(x + 2*mm, y + label_height - 15*mm, f"Location: {book.get('shelf_location', '')}")

            # Generate and add barcode
            barcode_image_bytes = self.generate_barcode_image(
                book['barcode_number'],
                barcode_type,
                include_text=True,
                width=280,
                height=8
            )

            barcode_path = os.path.join(self.upload_dir, f"temp_{uuid.uuid4()}.png")
            with open(barcode_path, 'wb') as f:
                f.write(barcode_image_bytes)

            pdf.drawImage(barcode_path, x + 2*mm, y + 5*mm, width=85*mm, height=18*mm, preserveAspectRatio=True)

            if os.path.exists(barcode_path):
                os.remove(barcode_path)

            book_index += 1

        pdf.save()
        buffer.seek(0)
        return buffer.getvalue()

    def validate_barcode(self, barcode_number: str, barcode_type: str = DEFAULT_FORMAT) -> Tuple[bool, str]:
        """
        Validate a barcode number

        Args:
            barcode_number: The barcode to validate
            barcode_type: Type of barcode

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            barcode_class = self.BARCODE_TYPES.get(barcode_type, barcode.Code128)

            # Try to create barcode (will raise exception if invalid)
            barcode_instance = barcode_class(barcode_number)

            return (True, "")
        except Exception as e:
            return (False, str(e))

    def save_barcode_file(
        self,
        barcode_number: str,
        format: str = 'png',
        barcode_type: str = DEFAULT_FORMAT
    ) -> str:
        """
        Save barcode to file and return file path

        Args:
            barcode_number: The barcode number
            format: File format (png or svg)
            barcode_type: Type of barcode

        Returns:
            File path
        """
        filename = f"{barcode_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}"
        filepath = os.path.join(self.upload_dir, filename)

        if format == 'svg':
            svg_content = self.generate_barcode_svg(barcode_number, barcode_type)
            with open(filepath, 'w') as f:
                f.write(svg_content)
        else:  # png
            png_bytes = self.generate_barcode_image(barcode_number, barcode_type)
            with open(filepath, 'wb') as f:
                f.write(png_bytes)

        return filepath


# Create singleton instance
barcode_service = BarcodeService()
