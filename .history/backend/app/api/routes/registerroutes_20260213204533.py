from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connections import get_db
from fastapi import File, UploadFile, Form
from app.model.registeruser import registeruser, forgotpasswordOTP
from app.model.registeruser import posts, userprofile, PostReports, Subscriptions
from app.schemas.register import RegisterUser, RegisterResponse, LoginResponse, LoginUser
from app.schemas.register import forgotpassword, resetpassword, forgotpasswordResponse, resetpasswordResponse, userprofileResponse
from app.schemas.register import postsResponse
from typing import List
import random as rnd
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.utils.security import create_access_token, verify_access_token
import os
import shutil
import uuid
import joblib
import sklearn
import warnings
warnings.filterwarnings('ignore')

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"))

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "..","..", "ml_model")
print(MODEL_DIR)
model_path = os.path.abspath(os.path.join(MODEL_DIR, "model.pkl"))
vector_path= os.path.abspath(os.path.join(MODEL_DIR, "vectorizer.pkl"))

vector=joblib.load(vector_path)
model=joblib.load(model_path)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "hackathon-secret-key"
ALGORITHM = "HS256"


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme),db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(userprofile).filter(userprofile.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
    

@router.post("/register", response_model=RegisterResponse)
def register_user(user: RegisterUser, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(registeruser).filter(
            (registeruser.email == user.email)
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user = registeruser(
            username=user.fullname,
            email=user.email,
            password=user.password
        )
        db.add(new_user)
        db.flush()
        
        new_profile = userprofile(
            user_id=new_user.id,
            about="",
            profile_pic=None
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_user)
        return {
            "message": "User registered successfully", 
            "user_id": new_user.id, 
            "fullname": new_user.username, 
            "email": new_user.email
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

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

@router.get("/loadprofile", response_model=userprofileResponse)
def profile(showprofile: userprofile = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(registeruser).filter(registeruser.id == showprofile.user_id).first()
    return {
        "username": user.username,
        "profile_picture": showprofile.profile_pic,
        "about": showprofile.about
    }

@router.put("/update-profile", response_model=userprofileResponse)
async def update_profile(
    about: str = Form(...),
    profile_pic: UploadFile = File(None),
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        current_user.about = about
        
        if profile_pic:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            
            file_extension = os.path.splitext(profile_pic.filename)[1]
            filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            contents = await profile_pic.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            current_user.profile_pic = f"/uploads/{filename}"
        
        db.commit()
        db.refresh(current_user)
        
        user = db.query(registeruser).filter(registeruser.id == current_user.user_id).first()
        
        return {
            "username": user.username,
            "profile_picture": current_user.profile_pic,
            "about": current_user.about
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/posts", response_model=postsResponse)
async def create_post(
    content: str = Form(...),
    media: UploadFile = File(None),
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user = db.query(registeruser).filter(registeruser.id == current_user.user_id).first()
        
        # ML CONTENT FILTER DISABLED FOR TESTING
        # Uncomment the lines below to re-enable content filtering
        # vector_matrix=vector.transform([content])
        # output=model.predict(vector_matrix)
        # if(output=='educational'):
        
        new_post = posts(
            user_id=user.id,
            content=content,
            media_url=None,
            media_type=None
        )
        
        # else:
        #     raise HTTPException(status_code=400, detail="Inappropriate content")      
        
        if media:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            
            file_extension = os.path.splitext(media.filename)[1]
            filename = f"post_{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            contents = await media.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            new_post.media_url = f"/uploads/{filename}"
            new_post.media_type = media.content_type
        
    
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        return {
            "id": new_post.id,
            "username": user.username,
            "profile_picture": current_user.profile_pic,
            "about": current_user.about or "",
            "content": new_post.content,
            "media_url": new_post.media_url
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts", response_model=List[postsResponse])
async def get_posts(
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        all_posts = db.query(posts).order_by(posts.id.desc()).all()
        
        posts_data = []
        for post in all_posts:
            user = db.query(registeruser).filter(registeruser.id == post.user_id).first()
            profile = db.query(userprofile).filter(userprofile.user_id == user.id).first()
            posts_data.append({
                "id": post.id,
                "username": user.username,
                "profile_picture": profile.profile_pic if profile else None,
                "about": profile.about if profile else "",
                "content": post.content,
                "media_url": post.media_url
            })
            
        return posts_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report-post/{post_id}")
async def report_post(
    post_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if post exists
        post = db.query(posts).filter(posts.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        # Check if user has already reported this post
        existing_report = db.query(PostReports).filter(
            PostReports.post_id == post_id,
            PostReports.user_id == current_user.user_id
        ).first()
        
        if existing_report:
            raise HTTPException(status_code=400, detail="You have already reported this post")
        
        # Add new report
        new_report = PostReports(
            post_id=post_id,
            user_id=current_user.user_id
        )
        db.add(new_report)
        db.commit()
        
        # Count total reports for this post
        report_count = db.query(PostReports).filter(PostReports.post_id == post_id).count()
        
        # If 3 or more reports, delete the post
        if report_count >= 3:
            db.delete(post)
            db.commit()
            return {
                "success": True,
                "message": "Post has been removed due to multiple reports",
                "deleted": True,
                "report_count": report_count
            }
        
        return {
            "success": True,
            "message": "Post reported successfully",
            "deleted": False,
            "report_count": report_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/subscribe/{user_id}")
async def subscribe_user(
    user_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if trying to subscribe to self
        if current_user.user_id == user_id:
            raise HTTPException(status_code=400, detail="You cannot subscribe to yourself")
        
        # Check if user exists
        target_user = db.query(registeruser).filter(registeruser.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if already subscribed
        existing_subscription = db.query(Subscriptions).filter(
            Subscriptions.subscriber_id == current_user.user_id,
            Subscriptions.subscribed_to_id == user_id
        ).first()
        
        if existing_subscription:
            # Unsubscribe
            db.delete(existing_subscription)
            db.commit()
            return {
                "success": True,
                "message": "Unsubscribed successfully",
                "subscribed": False
            }
        else:
            # Subscribe
            new_subscription = Subscriptions(
                subscriber_id=current_user.user_id,
                subscribed_to_id=user_id
            )
            db.add(new_subscription)
            db.commit()
            return {
                "success": True,
                "message": "Subscribed successfully",
                "subscribed": True
            }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check-subscription/{user_id}")
async def check_subscription(
    user_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        subscription = db.query(Subscriptions).filter(
            Subscriptions.subscriber_id == current_user.user_id,
            Subscriptions.subscribed_to_id == user_id
        ).first()
        
        return {
            "subscribed": subscription is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscribers/{user_id}")
async def get_subscribers(
    user_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get count of subscribers
        subscriber_count = db.query(Subscriptions).filter(
            Subscriptions.subscribed_to_id == user_id
        ).count()
        
        return {
            "subscriber_count": subscriber_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))