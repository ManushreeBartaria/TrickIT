from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connections import get_db
from app.model.registeruser import registeruser
from app.schemas.register import RegisterUser, RegisterResponse

router = APIRouter()

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
