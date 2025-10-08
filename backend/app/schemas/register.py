import profile
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

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
    access_token:str
    token_type:str

    model_config = {
        "from_attributes": True
    }        
    
class forgotpassword(BaseModel):
    email: EmailStr

    model_config = {
        "from_attributes": True
    }
    
class forgotpasswordResponse(BaseModel):
        otp:str
        model_config = {
        "from_attributes": True
    }
        
class resetpassword(BaseModel):
    otp:str
    newpassword: str


    model_config = {
        "from_attributes": True
    }    
    
class resetpasswordResponse(BaseModel):
    msg:str
    model_config = {
        "from_attributes": True
    }    
      
class userprofileResponse(BaseModel):
    username: str
    about: Optional[str] = None
    profile_picture: Optional[str] = None
    message: Optional[str] = None
    
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
    
    model_config = {
        "from_attributes": True
    }    