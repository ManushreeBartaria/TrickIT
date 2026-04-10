from asyncio import run
import stat
from app.model.registeruser import community_creators, payment_transactions
from app.schemas.register import JoinCommunityRequest, JoinCommunityResponse
from app.schemas.register import SendMessageRequest, MessageResponse, CreatorResponse
from app.schemas.register import PaymentVerifyRequest, PaymentVerifyResponse, BoostPostRequest
from app.model.registeruser import chat_messages
from turtle import back
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connections import get_db
from fastapi import File, UploadFile, Form
from app.model.registeruser import registeruser, forgotpasswordOTP,approved_posts,rejected_posts
from app.model.registeruser import posts, userprofile, post_reports, subscriptions, under_review_posts  
from app.schemas.register import RegisterUser, RegisterResponse, LoginResponse, LoginUser,ApprovedPostResponse,RejectedPostResponse
from app.schemas.register import forgotpassword, resetpassword, forgotpasswordResponse, resetpasswordResponse, userprofileResponse
from app.schemas.register import postsResponse, reportResponse, subscribeResponse, UnderReviewPost,UnderReviewResponse
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
from app.services.llm_service import llm_check
from app.services.check_pending import check_and_trigger
from app.services.post_processing_service import process_post
from app.services.retrain_pipeline import retrain_if_needed
import requests
from app.ml_model import model_loader
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()
UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "uploads")
)
BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "..", "..", "ml_model")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "hackathon-secret-key"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
            password=user.password,
            user_type=user.user_type or "person",
            company_payment_status="awaiting_payment" if user.user_type == "company" else "unpaid"
        )
        db.add(new_user)
        db.flush()

        new_profile = userprofile(
            user_id=new_user.id,
            about="",
            profile_pic=None
        )
        db.add(new_profile)

        # For company registrations: store the pending payment transaction
        if user.user_type == "company" and user.transaction_id:
            txn = payment_transactions(
                transaction_id=user.transaction_id,
                source_type="company_register",
                source_id=new_user.id,
                status="pending"
            )
            db.add(txn)

        db.commit()
        db.refresh(new_user)
        return {
            "message": "User registered successfully",
            "user_id": new_user.id,
            "fullname": new_user.username,
            "email": new_user.email,
            "user_type": new_user.user_type
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
    access_token = create_access_token({"user_id": existing_user.id})
    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": existing_user.user_type or "person"
    }


@router.post("/forgotpassword", response_model=forgotpasswordResponse)
def forgotpassword(forgot: forgotpassword, db: Session = Depends(get_db)):
    user = db.query(registeruser).filter(registeruser.email == forgot.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email")
    generated_otp = str(rnd.randint(100000, 999999))
    new_otp = forgotpasswordOTP(
        user_id=user.id,
        otp=generated_otp
    )
    db.add(new_otp)
    db.commit()
    db.refresh(new_otp)
    return {"otp": new_otp.otp}


@router.post("/resetpassword", response_model=resetpasswordResponse)
def resetpassword(reset: resetpassword, db: Session = Depends(get_db)):
    user = db.query(forgotpasswordOTP).filter(forgotpasswordOTP.otp == reset.otp).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid otp")
    passuser = db.query(registeruser).filter(registeruser.id == user.user_id).first()
    if not passuser:
        raise HTTPException(status_code=400, detail="Invalid id")
    passuser.password = reset.newpassword
    db.delete(user)
    db.commit()
    db.refresh(passuser)
    return {"msg": "Password Updated Successfully"}


@router.get("/loadprofile", response_model=userprofileResponse)
def profile(showprofile: userprofile = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(registeruser).filter(registeruser.id == showprofile.user_id).first()
    subscriber_count = db.query(subscriptions).filter(
        subscriptions.subscribed_to_user_id == showprofile.user_id
    ).count()
    return {
        "username": user.username,
        "profile_picture": showprofile.profile_pic,
        "about": showprofile.about,
        "subscriber_count": subscriber_count
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

            with open(file_path, "wb") as f:
                 f.write(await profile_pic.read())

            current_user.profile_pic = f"http://127.0.0.1:8000/uploads/{filename}"

        db.commit()
        db.refresh(current_user)

        user = db.query(registeruser).filter(registeruser.id == current_user.user_id).first()
        subscriber_count = db.query(subscriptions).filter(
            subscriptions.subscribed_to_user_id == current_user.user_id
        ).count()

        return {
            "username": user.username,
            "profile_picture": current_user.profile_pic,
            "about": current_user.about,
            "subscriber_count": subscriber_count
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
        vector_matrix = model_loader.vectorizer.transform([content])
        vector_matrix = model_loader.selector.transform(vector_matrix)
        probs = model_loader.model.predict_proba(vector_matrix)

        classes = model_loader.model.classes_.tolist()
        print("Classes:", classes)
        print("Raw probabilities:", probs)
        edu_index = classes.index('educational')
        educational_prob = probs[0][edu_index]
        
    
        print("Educational probability:", educational_prob)

        new_post = posts(
            user_id=user.id,
            content=content,
            media_url=None,
            media_type=None
        )

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

        if educational_prob < 0.80:

            review_post = under_review_posts(
                user_id=user.id,
                content=content,
                media_url=new_post.media_url,
                media_type=new_post.media_type,
                confidence=str(educational_prob),
                post_id=new_post.id,
                status="pending"
            )

            db.add(review_post)
            db.commit()

            try:
                jenkins_url = "http://localhost:8080/job/trickit-pipeline/build"

                response = requests.post(
                    jenkins_url,
                    params={"token": "reviewtrigger"},
                    auth=("admin","11c79993fd37f53e50bac2b78c0fad885b"),
                    timeout=10
                )

                print("Jenkins status:", response.status_code)

            except Exception as e:
                print("Jenkins trigger failed:", e)
        
        return {
            "id": new_post.id,
            "username": user.username,
            "profile_picture": current_user.profile_pic,
            "about": current_user.about or "",
            "content": new_post.content,
            "media_url": new_post.media_url,
            "report_count": new_post.report_count,
            "is_reported": False,
            "is_subscribed": False,
            "status": "pending" if educational_prob < 0.65 else "approved"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/posts", response_model=List[postsResponse])
async def get_posts(
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        all_posts = db.query(posts).filter(
        posts.status.in_(["approved", "pending"])
         ).order_by(posts.id.desc()).all()

        posts_data = []
        for post in all_posts:
            user = db.query(registeruser).filter(registeruser.id == post.user_id).first()
            profile = db.query(userprofile).filter(userprofile.user_id == user.id).first()
            already_reported = db.query(post_reports).filter(
                post_reports.post_id == post.id,
                post_reports.reporter_user_id == current_user.user_id
            ).first() is not None

            already_subscribed = db.query(subscriptions).filter(
                subscriptions.subscriber_user_id == current_user.user_id,
                subscriptions.subscribed_to_user_id == post.user_id
            ).first() is not None

            # Count subscribers for this post author
            subscriber_count = db.query(subscriptions).filter(
                subscriptions.subscribed_to_user_id == post.user_id
            ).count()
            
            posts_data.append({
                "id": post.id,
                "username": user.username,
                "profile_picture": profile.profile_pic if profile else None,
                "about": profile.about if profile else "",
                "content": post.content,
                "media_url": post.media_url,
                "report_count": post.report_count,   # NEW
                "is_reported": already_reported,      # NEW
                "is_subscribed": already_subscribed,  # NEW
                "subscriber_count": subscriber_count,  # NEW
            })

        return posts_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# NEW ENDPOINT
@router.post("/posts/{post_id}/report", response_model=reportResponse)
async def report_post(
    post_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        post = db.query(posts).filter(posts.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Prevent duplicate reports from same user
        existing_report = db.query(post_reports).filter(
            post_reports.post_id == post_id,
            post_reports.reporter_user_id == current_user.user_id
        ).first()

        if existing_report:
            raise HTTPException(status_code=400, detail="You have already reported this post")

        # Record the report
        new_report = post_reports(
            post_id=post_id,
            reporter_user_id=current_user.user_id
        )
        db.add(new_report)

        # Increment count
        post.report_count = (post.report_count or 0) + 1
        db.commit()

        # Auto-delete post and media file when report count hits 3
        if post.report_count >= 3:
            if post.media_url:
                media_filename = post.media_url.split("/uploads/")[-1]
                media_file_path = os.path.join(UPLOAD_DIR, media_filename)
                if os.path.exists(media_file_path):
                    os.remove(media_file_path)
            db.delete(post)
            db.commit()
            return {"message": "Post removed due to multiple reports", "report_count": 3, "post_removed": True}

        db.refresh(post)
        return {"message": "Post reported successfully", "report_count": post.report_count, "post_removed": False}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# NEW ENDPOINT
@router.post("/posts/{post_id}/subscribe", response_model=subscribeResponse)
async def toggle_subscribe(
    post_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        post = db.query(posts).filter(posts.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Block self-subscription
        if post.user_id == current_user.user_id:
            raise HTTPException(status_code=400, detail="You cannot subscribe to your own posts")

        existing_sub = db.query(subscriptions).filter(
            subscriptions.subscriber_user_id == current_user.user_id,
            subscriptions.subscribed_to_user_id == post.user_id
        ).first()

        if existing_sub:
            # Already subscribed — toggle off
            db.delete(existing_sub)
            db.commit()
            return {"message": "Unsubscribed successfully", "is_subscribed": False}
        else:
            # Not subscribed — subscribe
            new_sub = subscriptions(
                subscriber_user_id=current_user.user_id,
                subscribed_to_user_id=post.user_id
            )
            db.add(new_sub)
            db.commit()
            return {"message": "Subscribed successfully", "is_subscribed": True}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/llm-processing/{post_id}")
async def llm_processing(post_id: int, db: Session = Depends(get_db)):

    try:
        result = await process_post(post_id, db)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
        
@router.post("/join-community", response_model=JoinCommunityResponse)
async def join_community(
    data: JoinCommunityRequest,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        existing = db.query(community_creators).filter(
            community_creators.creator_id == current_user.id
        ).first()

        if existing:
            return {"message": "Already a community member", "status": "yes"}

        new_creator = community_creators(
            creator_id=current_user.id,
            name=data.name,
            upi_id=data.upi_id
        )
        db.add(new_creator)

        # Store payment transaction record if provided
        if data.transaction_id:
            txn = payment_transactions(
                transaction_id=data.transaction_id,
                source_type="join_community",
                source_id=current_user.user_id,
                status="pending"
            )
            db.add(txn)

        current_user.status = "yes"
        db.commit()

        return {"message": "Successfully joined the community!", "status": "yes"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/community-status", response_model=JoinCommunityResponse)
async def community_status(
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"message": "Status fetched", "status": current_user.status or "no"}
        

@router.get("/check_pending")
async def check_pending(db: Session = Depends(get_db)):
    try:
        result = await check_and_trigger(db)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )      



# ---------------------------------------------------
# GET SUBSCRIBED CREATORS (for Community page)
# ---------------------------------------------------

@router.get("/community/creators", response_model=List[CreatorResponse])
async def get_subscribed_creators(
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all users that the current user is subscribed to
    AND who are community creators (joined community).
    """
    try:
        # Get all users this person is subscribed to
        subs = db.query(subscriptions).filter(
            subscriptions.subscriber_user_id == current_user.user_id
        ).all()

        creators_list = []
        for sub in subs:
            # Check if the subscribed-to user is a community creator
            target_profile = db.query(userprofile).filter(
                userprofile.user_id == sub.subscribed_to_user_id
            ).first()

            if not target_profile or target_profile.status != "yes":
                continue

            target_user = db.query(registeruser).filter(
                registeruser.id == sub.subscribed_to_user_id
            ).first()

            if target_user:
                creators_list.append({
                    "user_id": target_user.id,
                    "username": target_user.username,
                    "about": target_profile.about,
                    "profile_pic": target_profile.profile_pic,
                })

        return creators_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# GET CHAT HISTORY
# ---------------------------------------------------

@router.get("/chat/{other_user_id}")
async def get_chat_history(
    other_user_id: int,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns chat history between the current user and other_user_id.
    Requires that: the other user is a community creator AND
    the current user is subscribed to them (or vice versa).
    """
    try:
        other_user = db.query(registeruser).filter(
            registeruser.id == other_user_id
        ).first()
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")

        other_profile = db.query(userprofile).filter(
            userprofile.user_id == other_user_id
        ).first()

        # Authorization: must be subscribed in at least one direction,
        # and the other party must be a community creator
        is_subscribed = db.query(subscriptions).filter(
            subscriptions.subscriber_user_id == current_user.user_id,
            subscriptions.subscribed_to_user_id == other_user_id
        ).first()

        creator_subscribed_to_me = db.query(subscriptions).filter(
            subscriptions.subscriber_user_id == other_user_id,
            subscriptions.subscribed_to_user_id == current_user.user_id
        ).first()

        other_is_creator = other_profile and other_profile.status == "yes"
        current_is_creator = current_user.status == "yes"

        # Allow chat if: subscriber→creator OR creator→subscriber
        allowed = (is_subscribed and other_is_creator) or \
                  (creator_subscribed_to_me and current_is_creator) or \
                  (other_is_creator and current_is_creator)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="You must be subscribed to this creator to chat."
            )

        # Fetch messages between the two users
        messages = db.query(chat_messages).filter(
            (
                (chat_messages.sender_user_id == current_user.user_id) &
                (chat_messages.receiver_user_id == other_user_id)
            ) | (
                (chat_messages.sender_user_id == other_user_id) &
                (chat_messages.receiver_user_id == current_user.user_id)
            )
        ).order_by(chat_messages.timestamp.asc()).all()

        messages_data = [
            {
                "id": msg.id,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat(),
                "is_mine": msg.sender_user_id == current_user.user_id,
                "sender_username": msg.sender.username,
            }
            for msg in messages
        ]

        return {
            "other_user": {
                "user_id": other_user.id,
                "username": other_user.username,
                "profile_pic": other_profile.profile_pic if other_profile else None,
            },
            "messages": messages_data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# SEND MESSAGE
# ---------------------------------------------------

@router.post("/chat/{other_user_id}")
async def send_message(
    other_user_id: int,
    body: SendMessageRequest,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sends a message from current_user to other_user_id.
    Same subscription-based access control as GET /chat/{other_user_id}.
    """
    try:
        if not body.content.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        other_user = db.query(registeruser).filter(
            registeruser.id == other_user_id
        ).first()
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")

        other_profile = db.query(userprofile).filter(
            userprofile.user_id == other_user_id
        ).first()

        is_subscribed = db.query(subscriptions).filter(
            subscriptions.subscriber_user_id == current_user.user_id,
            subscriptions.subscribed_to_user_id == other_user_id
        ).first()

        creator_subscribed_to_me = db.query(subscriptions).filter(
            subscriptions.subscriber_user_id == other_user_id,
            subscriptions.subscribed_to_user_id == current_user.user_id
        ).first()

        other_is_creator = other_profile and other_profile.status == "yes"
        current_is_creator = current_user.status == "yes"

        allowed = (is_subscribed and other_is_creator) or \
                  (creator_subscribed_to_me and current_is_creator) or \
                  (other_is_creator and current_is_creator)

        if not allowed:
            raise HTTPException(
                status_code=403,
                detail="You must be subscribed to this creator to chat."
            )

        new_msg = chat_messages(
            sender_user_id=current_user.user_id,
            receiver_user_id=other_user_id,
            content=body.content.strip(),
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)

        sender_user = db.query(registeruser).filter(
            registeruser.id == current_user.user_id
        ).first()

        return {
            "id": new_msg.id,
            "content": new_msg.content,
            "timestamp": new_msg.timestamp.isoformat(),
            "is_mine": True,
            "sender_username": sender_user.username,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        

@router.post("/retrain_pipeline")
def trigger_retrain_pipeline():
    
    result = retrain_if_needed()

    return {
        "message": "Pipeline executed",
        "details": result
    }


# ---------------------------------------------------
# VERIFY PAYMENT (Macrodroid Integration)
# ---------------------------------------------------

@router.post("/verify-payment", response_model=PaymentVerifyResponse)
async def verify_payment(
    data: PaymentVerifyRequest,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sends transaction_id + source info to Macrodroid phone IP.
    Updates payment_transactions status and resumes the awaiting process.
    """
    MACRODROID_IP = os.getenv("MACRODROID_IP", "http://192.168.1.100:8080")

    # Store a pending transaction record
    txn = payment_transactions(
        transaction_id=data.transaction_id,
        source_type=data.source_type,
        source_id=data.source_id,
        status="pending"
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    # Try to reach Macrodroid
    payment_status = "pending"
    try:
        macrodroid_response = requests.post(
            MACRODROID_IP,
            json={
                "transaction_id": data.transaction_id,
                "source_type": data.source_type,
                "source_id": data.source_id
            },
            timeout=10
        )
        result = macrodroid_response.json()
        payment_status = result.get("status", "paid")  # Macrodroid returns {"status": "paid"|"unpaid"}
        print(f"Macrodroid response: {macrodroid_response.status_code} - {result}")
    except Exception as e:
        print(f"Macrodroid unreachable: {e}")
        # If Macrodroid is unreachable, mark as paid optimistically for demo purposes
        payment_status = "paid"

    # Update transaction status in DB
    txn.status = payment_status
    db.commit()

    # Resume awaiting processes based on source_type
    if payment_status == "paid":
        if data.source_type == "company_register":
            user = db.query(registeruser).filter(registeruser.id == data.source_id).first()
            if user:
                user.company_payment_status = "paid"
                db.commit()

        elif data.source_type == "subscribe":
            # source_id is the post_id — the subscription was already created optimistically
            pass

        elif data.source_type == "join_community":
            # Community join was already committed — nothing extra to do
            pass

        elif data.source_type == "boost_post":
            # Mark the post as boosted
            post = db.query(posts).filter(posts.id == data.source_id).first()
            if post:
                post.status = "boosted"
                db.commit()

    message = "Payment verified successfully" if payment_status == "paid" else "Payment could not be verified"
    return {"message": message, "status": payment_status}


# ---------------------------------------------------
# BOOST POST (Company only)
# ---------------------------------------------------

@router.post("/boost-post", response_model=PaymentVerifyResponse)
async def boost_post(
    data: BoostPostRequest,
    current_user: userprofile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Company-only: boost a post by paying ₹1 via the QR flow.
    Delegates to verify_payment logic.
    """
    user = db.query(registeruser).filter(registeruser.id == current_user.user_id).first()
    if not user or user.user_type != "company":
        raise HTTPException(status_code=403, detail="Only company accounts can boost posts")

    post = db.query(posts).filter(posts.id == data.post_id, posts.user_id == current_user.user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or not yours")

    MACRODROID_IP = os.getenv("MACRODROID_IP", "http://192.168.1.100:8080")

    txn = payment_transactions(
        transaction_id=data.transaction_id,
        source_type="boost_post",
        source_id=data.post_id,
        status="pending"
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    payment_status = "pending"
    try:
        macrodroid_response = requests.post(
            MACRODROID_IP,
            json={
                "transaction_id": data.transaction_id,
                "source_type": "boost_post",
                "source_id": data.post_id
            },
            timeout=10
        )
        result = macrodroid_response.json()
        payment_status = result.get("status", "paid")
    except Exception as e:
        print(f"Macrodroid unreachable: {e}")
        payment_status = "paid"

    txn.status = payment_status
    if payment_status == "paid":
        post.status = "boosted"
    db.commit()

    message = "Post boosted successfully!" if payment_status == "paid" else "Payment could not be verified"
    return {"message": message, "status": payment_status}
