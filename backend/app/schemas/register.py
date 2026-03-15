import profile
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class RegisterUser(BaseModel):
    fullname: str
    email: EmailStr
    password: str

    model_config = {
        "from_attributes": True
    }

class RegisterResponse(BaseModel):
    message: str
    user_id: int
    fullname: str
    email: EmailStr

    model_config = {
        "from_attributes": True
    }

class LoginUser(BaseModel):
    email: EmailStr
    password: str

    model_config = {
        "from_attributes": True
    }

class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str

    model_config = {
        "from_attributes": True
    }

class forgotpassword(BaseModel):
    email: EmailStr

    model_config = {
        "from_attributes": True
    }

class forgotpasswordResponse(BaseModel):
    otp: str
    model_config = {
        "from_attributes": True
    }

class resetpassword(BaseModel):
    otp: str
    newpassword: str

    model_config = {
        "from_attributes": True
    }

class resetpasswordResponse(BaseModel):
    msg: str
    model_config = {
        "from_attributes": True
    }

class userprofileResponse(BaseModel):
    username: str
    about: Optional[str] = None
    profile_picture: Optional[str] = None
    message: Optional[str] = None
    subscriber_count: Optional[int] = 0

    model_config = {
        "from_attributes": True
    }

class postsResponse(BaseModel):
    id: Optional[int] = None
    username: str
    profile_picture: Optional[str] = None
    about: Optional[str] = None
    content: Optional[str] = None
    media_url: Optional[str] = None
    report_count: Optional[int] = 0
    is_subscribed: Optional[bool] = False
    is_reported: Optional[bool] = False

    model_config = {
        "from_attributes": True
    }

class reportResponse(BaseModel):
    message: str
    report_count: int
    post_removed: bool

    model_config = {
        "from_attributes": True
    }

class subscribeResponse(BaseModel):
    message: str
    is_subscribed: bool

    model_config = {
        "from_attributes": True
    }


# ------------------------------------------------
# UPDATED SCHEMAS FOR UNDER REVIEW POSTS
# ------------------------------------------------

class UnderReviewPost(BaseModel):
    user_id: int
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    confidence: str
    status: Optional[str] = "pending"

    model_config = {
        "from_attributes": True
    }


class UnderReviewResponse(BaseModel):
    id: int
    user_id: int
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    confidence: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


# ------------------------------------------------
# NEW SCHEMAS FOR APPROVED POSTS
# ------------------------------------------------

class ApprovedPostResponse(BaseModel):
    id: int
    post_id: int
    approved_at: datetime

    model_config = {
        "from_attributes": True
    }


# ------------------------------------------------
# NEW SCHEMAS FOR REJECTED POSTS
# ------------------------------------------------

class RejectedPostResponse(BaseModel):
    id: int
    post_id: int
    rejected_at: datetime
    reason: Optional[str] = None

    model_config = {
        "from_attributes": True
    }