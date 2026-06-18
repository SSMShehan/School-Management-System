from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from ..database import get_db
from ..models.user import User, UserRole
from ..auth import security
from ..schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        branch_id_str: str = payload.get("branch_id")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    
    # Attach branch_id from token to user object for easy access
    # This ensures we use the branch_id from token, not from DB (in case DB is stale)
    user._token_branch_id = UUID(branch_id_str) if branch_id_str else None
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    # You could add an 'is_active' field to User model later
    return current_user

# RBAC Dependency Factory
class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Operation not permitted"
            )
        return user

# Pre-defined Role Checkers
admin_only = RoleChecker([UserRole.ADMIN])
teacher_only = RoleChecker([UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER])
staff_only = RoleChecker([UserRole.ADMIN, UserRole.PRINCIPAL, UserRole.REGISTRAR])


# Branch Scoping Dependency
def get_branch_filter(current_user: User = Depends(get_current_active_user)) -> Optional[UUID]:
    """
    Returns branch_id to filter by, or None for admin (all branches).
    Admin users can see all branches, others see only their branch.
    """
    if current_user.role == UserRole.ADMIN:
        return None  # Admin sees all branches
    
    # Get branch_id from token (attached in get_current_user)
    branch_id = getattr(current_user, '_token_branch_id', None) or current_user.branch_id
    return branch_id
