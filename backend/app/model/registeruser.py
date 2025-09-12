from sqlalchemy import Column, Integer, String,ForeignKey
from app.database.connections import Base
from sqlalchemy.orm import relationship

class registeruser(Base):
    __tablename__ = "register_user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    
    otps = relationship("forgotpasswordOTP", back_populates="user", cascade="all, delete-orphan")
    
class forgotpasswordOTP(Base):
    __tablename__ = "forgotpassword_otp"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer,ForeignKey("register_user.id"))
    otp = Column(String(10), nullable=False)    
 
    user = relationship("registeruser", back_populates="otps")