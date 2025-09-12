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
    newpassword: str
    confirmpassword: str

    model_config = {
        "from_attributes": True
    }        
        