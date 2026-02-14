from sqlalchemy import Column, Integer, String,ForeignKey,Text
from app.database.connections import Base
from sqlalchemy.orm import relationship

class registeruser(Base):
    __tablename__ = "register_user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    
    otps = relationship("forgotpasswordOTP", back_populates="user", cascade="all, delete-orphan")
    user_profile = relationship("userprofile", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("posts", back_populates="user", cascade="all, delete-orphan")
    
class forgotpasswordOTP(Base):
    __tablename__ = "forgotpassword_otp"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer,ForeignKey("register_user.id"))
    otp = Column(String(10), nullable=False)    
 
    user = relationship("registeruser", back_populates="otps")
    
class userprofile(Base):
    __tablename__="profile"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("register_user.id"))
    about = Column(Text, nullable=True) 
    profile_pic = Column(String(255), nullable=True)
 
    user = relationship("registeruser", back_populates="user_profile")
    

class posts(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("register_user.id"))
    content = Column(Text, nullable=True)  
    media_url = Column(String(255), nullable=True)  
    media_type = Column(String(50), nullable=True)  

    
    user = relationship("registeruser", back_populates="posts")