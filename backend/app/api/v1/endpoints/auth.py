"""
Authentication endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Optional
from pydantic import BaseModel, EmailStr
from ....models.auth import LoginRequest, LoginResponse, UserResponse, TokenResponse
from ....services.auth_service import AuthService

router = APIRouter()


def get_auth_service() -> AuthService:
    """Dependency to get auth service instance"""
    return AuthService()


# Additional Pydantic models for new endpoints
class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/login", response_model=LoginResponse, summary="User login")
async def login(login_data: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    """
    Authenticate user and return JWT tokens

    - **email**: User email address
    - **password**: User password
    - **remember_me**: Remember user for extended period
    """
    # Authenticate user
    user = await auth_service.authenticate_user(login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate tokens
    tokens = auth_service.generate_tokens(user, login_data.remember_me)

    # Prepare user response
    user_response = UserResponse(
        id=user['id'],
        email=user['email'],
        full_name=user['full_name'],
        role=user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron',
        user_type=user['user_type'],
        is_active=user['is_active'],
        created_at=user['created_at']
    )

    return LoginResponse(
        user=user_response,
        tokens=TokenResponse(**tokens),
        message="Login successful"
    )


@router.post("/logout", summary="User logout")
async def logout():
    """
    Logout user (invalidate tokens on client side)
    """
    return {"message": "Logout successful"}


@router.get("/me", summary="Get current user")
async def get_current_user(
    x_user_id: Optional[str] = Header(None, description="User ID from dev mode"),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get current authenticated user information
    (Currently uses X-User-Id header for dev mode)
    TODO: Implement proper JWT token validation
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    try:
        user = await auth_service.get_user_by_id(x_user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(
            id=user['id'],
            email=user['email'],
            full_name=user['full_name'],
            role=user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron',
            user_type=user['user_type'],
            is_active=user['is_active'],
            created_at=user['created_at']
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Refresh access token using refresh token

    - **refresh_token**: Valid refresh token

    Returns new access_token and refresh_token
    """
    try:
        # Validate refresh token and generate new tokens
        tokens = auth_service.refresh_access_token(refresh_data.refresh_token)

        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenResponse(**tokens)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh token: {str(e)}"
        )


@router.post("/password-reset/request", summary="Request password reset")
async def request_password_reset(
    reset_request: PasswordResetRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Request password reset email

    - **email**: User email address

    Returns success message (always returns success for security)
    """
    try:
        # Send password reset email
        # Note: Always return success to prevent email enumeration
        await auth_service.send_password_reset_email(reset_request.email)

        return {
            "message": "If the email exists, a password reset link has been sent"
        }
    except Exception as e:
        # Log error but still return success message
        print(f"Password reset request error: {str(e)}")
        return {
            "message": "If the email exists, a password reset link has been sent"
        }


@router.post("/password-reset/confirm", summary="Confirm password reset")
async def confirm_password_reset(
    reset_confirm: PasswordResetConfirm,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Reset password with token

    - **token**: Password reset token from email
    - **new_password**: New password (min 8 characters)
    """
    try:
        # Validate token and reset password
        success = await auth_service.reset_password_with_token(
            reset_confirm.token,
            reset_confirm.new_password
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        return {"message": "Password reset successful"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )


@router.post("/change-password", summary="Change password (authenticated)")
async def change_password(
    password_change: ChangePasswordRequest,
    x_user_id: Optional[str] = Header(None, description="User ID from auth token"),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Change password for authenticated user

    - **current_password**: Current password
    - **new_password**: New password (min 8 characters)

    Requires authentication (X-User-Id header in dev mode)
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        # Verify current password and update
        success = await auth_service.change_user_password(
            x_user_id,
            password_change.current_password,
            password_change.new_password
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )

        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )
