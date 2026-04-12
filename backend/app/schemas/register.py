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
    subscriber_count: Optional[int] = 0
    can_subscribe: Optional[bool] = False        # True if post author is a creator and not own post
    is_community_creator: Optional[bool] = False # True if the post author has joined community
    is_own_post: Optional[bool] = False          # True if the viewer is the post author
    viewer_has_paid: Optional[bool] = False      # True if current user has completed payment

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

class JoinCommunityRequest(BaseModel):
    name: str
    upi_id: str

    model_config = {"from_attributes": True}

class JoinCommunityResponse(BaseModel):
    message: str
    status: str

    model_config = {"from_attributes": True}


# ------------------------------------------------
# CHAT SCHEMAS
# ------------------------------------------------

class SendMessageRequest(BaseModel):
    content: str

    model_config = {"from_attributes": True}

class MessageResponse(BaseModel):
    id: int
    content: str
    timestamp: datetime
    is_mine: bool
    sender_username: str

    model_config = {"from_attributes": True}

class ChatHistoryResponse(BaseModel):
    other_user: dict
    messages: list

    model_config = {"from_attributes": True}

class CreatorResponse(BaseModel):
    user_id: int
    username: str
    about: Optional[str] = None
    profile_pic: Optional[str] = None
    has_message: Optional[bool] = False

    model_config = {"from_attributes": True}

# ------------------------------------------------
# PAYMENT SCHEMAS
# ------------------------------------------------

class PaymentInitiateResponse(BaseModel):
    payment_id: int
    amount: str
    upi_id: str          # platform UPI to pay to
    message: str
    status: str

    model_config = {"from_attributes": True}


class PaymentVerifyRequest(BaseModel):
    payment_id: int
    upi_ref: str         # transaction reference entered by the user after paying

    model_config = {"from_attributes": True}


class PaymentStatusResponse(BaseModel):
    has_paid: bool
    status: str          # "not_initiated" | "pending" | "completed"
    payment_id: Optional[int] = None

    model_config = {"from_attributes": True}