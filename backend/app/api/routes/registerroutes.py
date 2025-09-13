from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connections import get_db
from app.model.registeruser import registeruser,forgotpasswordOTP
from app.schemas.register import RegisterUser, RegisterResponse, LoginResponse, LoginUser
from app.schemas.register import forgotpassword,resetpassword,forgotpasswordResponse,resetpasswordResponse
import random as rnd
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.utils.security import create_access_token,verify_access_token

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

@router.post("/register", response_model=RegisterResponse)
def register_user(user: RegisterUser, db: Session = Depends(get_db)):
    existing_user = db.query(registeruser).filter(
        (registeruser.username == user.fullname) | (registeruser.email == user.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    new_user = registeruser(
        username=user.fullname,
        email=user.email,
        password=user.password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id, "fullname": new_user.username, "email": new_user.email}

@router.post("/login", response_model=LoginResponse)
def login_user(user: LoginUser, db: Session = Depends(get_db)):
    existing_user = db.query(registeruser).filter(
        (registeruser.email == user.email) & (registeruser.password == user.password)
    ).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    access_token = create_access_token({"user_id":existing_user.id})
    return {"message": "Login successful","access_token": access_token, "token_type": "bearer"}

@router.post("/forgotpassword",response_model=forgotpasswordResponse)
def forgotpassword(forgot:forgotpassword,db:Session=Depends(get_db)):
    user=db.query(registeruser).filter(registeruser.email==forgot.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email")
    generated_otp=str(rnd.randint(100000, 999999))
    new_otp=forgotpasswordOTP(
        user_id=user.id,
        otp=generated_otp
    )
    db.add(new_otp)
    db.commit()
    db.refresh(new_otp)
    return {"otp":new_otp.otp}

@router.post("/resetpassword",response_model=resetpasswordResponse)
def resetpassword(reset:resetpassword,db:Session=Depends(get_db)):
    user=db.query(forgotpasswordOTP).filter(forgotpasswordOTP.otp==reset.otp).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid otp")
    passuser=db.query(registeruser).filter(registeruser.id==user.user_id).first()
    if not passuser:
        raise HTTPException(status_code=400, detail="Invalid id")
    passuser.password=reset.newpassword
    db.delete(user)
    db.commit()
    db.refresh(passuser)
    return  {"msg":"Password Updated Successfully"}