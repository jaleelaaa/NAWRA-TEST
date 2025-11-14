"""
File Upload Service

Handles file uploads to Supabase Storage with validation and processing
"""
import os
import uuid
import mimetypes
from typing import Optional, Tuple, BinaryIO
from datetime import datetime
from pathlib import Path
import aiofiles
from PIL import Image
import io

from app.core.config import get_settings
from app.db.supabase_client import get_supabase_client

settings = get_settings()


class FileUploadService:
    """Service for handling file uploads"""

    def __init__(self):
        self.supabase = get_supabase_client()
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_UPLOAD_EXTENSIONS
        self.storage_bucket = "library-files"  # Supabase storage bucket name

        # Image size constraints
        self.max_image_width = 2048
        self.max_image_height = 2048
        self.thumbnail_size = (300, 400)  # For book covers

    def validate_file(
        self,
        filename: str,
        file_size: int,
        allowed_types: Optional[list] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate file before upload

        Args:
            filename: Name of the file
            file_size: Size of the file in bytes
            allowed_types: List of allowed MIME types (optional)

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size
        if file_size > self.max_file_size:
            max_mb = self.max_file_size / (1024 * 1024)
            return False, f"File size exceeds maximum allowed size of {max_mb}MB"

        # Check file extension
        file_ext = Path(filename).suffix.lower()
        if file_ext not in self.allowed_extensions:
            return False, f"File type {file_ext} not allowed. Allowed types: {', '.join(self.allowed_extensions)}"

        # Check MIME type if specified
        if allowed_types:
            mime_type, _ = mimetypes.guess_type(filename)
            if mime_type not in allowed_types:
                return False, f"MIME type {mime_type} not allowed"

        return True, None

    async def upload_book_cover(
        self,
        file_content: bytes,
        filename: str,
        book_id: str,
        create_thumbnail: bool = True
    ) -> dict:
        """
        Upload book cover image

        Args:
            file_content: Binary file content
            filename: Original filename
            book_id: UUID of the book
            create_thumbnail: Whether to create a thumbnail

        Returns:
            Dict with cover_url and thumbnail_url
        """
        # Validate file
        is_valid, error = self.validate_file(
            filename,
            len(file_content),
            allowed_types=['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
        )
        if not is_valid:
            raise ValueError(error)

        try:
            # Open and process image
            image = Image.open(io.BytesIO(file_content))

            # Convert RGBA to RGB if necessary
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background

            # Resize if too large
            if image.width > self.max_image_width or image.height > self.max_image_height:
                image.thumbnail((self.max_image_width, self.max_image_height), Image.Resampling.LANCZOS)

            # Save optimized cover
            cover_buffer = io.BytesIO()
            image.save(cover_buffer, format='JPEG', quality=85, optimize=True)
            cover_bytes = cover_buffer.getvalue()

            # Upload cover image
            file_ext = Path(filename).suffix.lower()
            cover_filename = f"covers/{book_id}/cover{file_ext}"
            cover_url = await self._upload_to_supabase(cover_bytes, cover_filename, 'image/jpeg')

            result = {"cover_url": cover_url}

            # Create and upload thumbnail if requested
            if create_thumbnail:
                thumbnail = image.copy()
                thumbnail.thumbnail(self.thumbnail_size, Image.Resampling.LANCZOS)

                thumb_buffer = io.BytesIO()
                thumbnail.save(thumb_buffer, format='JPEG', quality=80, optimize=True)
                thumb_bytes = thumb_buffer.getvalue()

                thumb_filename = f"covers/{book_id}/thumbnail{file_ext}"
                thumb_url = await self._upload_to_supabase(thumb_bytes, thumb_filename, 'image/jpeg')
                result["thumbnail_url"] = thumb_url

            return result

        except Exception as e:
            raise ValueError(f"Failed to process image: {str(e)}")

    async def upload_document(
        self,
        file_content: bytes,
        filename: str,
        folder: str = "documents"
    ) -> str:
        """
        Upload document file

        Args:
            file_content: Binary file content
            filename: Original filename
            folder: Storage folder path

        Returns:
            URL of uploaded document
        """
        # Validate file
        is_valid, error = self.validate_file(filename, len(file_content))
        if not is_valid:
            raise ValueError(error)

        try:
            # Generate unique filename
            file_ext = Path(filename).suffix.lower()
            unique_filename = f"{folder}/{uuid.uuid4()}{file_ext}"

            # Determine MIME type
            mime_type, _ = mimetypes.guess_type(filename)
            if not mime_type:
                mime_type = 'application/octet-stream'

            # Upload to Supabase
            file_url = await self._upload_to_supabase(file_content, unique_filename, mime_type)

            return file_url

        except Exception as e:
            raise ValueError(f"Failed to upload document: {str(e)}")

    async def _upload_to_supabase(
        self,
        file_content: bytes,
        file_path: str,
        content_type: str
    ) -> str:
        """
        Upload file to Supabase Storage

        Args:
            file_content: Binary file content
            file_path: Path in storage bucket
            content_type: MIME type

        Returns:
            Public URL of uploaded file
        """
        try:
            # Upload file
            response = self.supabase.storage.from_(self.storage_bucket).upload(
                path=file_path,
                file=file_content,
                file_options={
                    "content-type": content_type,
                    "upsert": "true"  # Overwrite if exists
                }
            )

            # Get public URL
            public_url = self.supabase.storage.from_(self.storage_bucket).get_public_url(file_path)

            return public_url

        except Exception as e:
            raise ValueError(f"Failed to upload to Supabase Storage: {str(e)}")

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete file from Supabase Storage

        Args:
            file_path: Path of file in storage bucket

        Returns:
            True if deleted successfully
        """
        try:
            self.supabase.storage.from_(self.storage_bucket).remove([file_path])
            return True
        except Exception as e:
            print(f"Failed to delete file: {str(e)}")
            return False

    async def delete_book_cover(self, book_id: str) -> bool:
        """
        Delete book cover and thumbnail

        Args:
            book_id: UUID of the book

        Returns:
            True if deleted successfully
        """
        try:
            # Delete entire folder for book
            folder_path = f"covers/{book_id}/"
            files_to_delete = []

            # List files in folder
            try:
                file_list = self.supabase.storage.from_(self.storage_bucket).list(folder_path)
                files_to_delete = [f"{folder_path}{f['name']}" for f in file_list]
            except:
                pass

            # Delete files
            if files_to_delete:
                self.supabase.storage.from_(self.storage_bucket).remove(files_to_delete)

            return True
        except Exception as e:
            print(f"Failed to delete book cover: {str(e)}")
            return False

    def get_file_info(self, file_path: str) -> Optional[dict]:
        """
        Get file metadata

        Args:
            file_path: Path of file in storage bucket

        Returns:
            File metadata dict or None
        """
        try:
            # Get file metadata from Supabase
            # Note: Supabase doesn't provide direct metadata API
            # This is a placeholder for future implementation
            return {
                "path": file_path,
                "url": self.supabase.storage.from_(self.storage_bucket).get_public_url(file_path)
            }
        except Exception as e:
            print(f"Failed to get file info: {str(e)}")
            return None


# Singleton instance
_file_upload_service = None


def get_file_upload_service() -> FileUploadService:
    """Get file upload service singleton instance"""
    global _file_upload_service
    if _file_upload_service is None:
        _file_upload_service = FileUploadService()
    return _file_upload_service
