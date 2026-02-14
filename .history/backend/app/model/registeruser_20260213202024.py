from sqlalchemy import Column, Integer, String, ForeignKey, Text, UniqueConstraint
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
    user_id = Column(Integer, ForeignKey("register_user.id"))
    otp = Column(String(10), nullable=False)

    user = relationship("registeruser", back_populates="otps")

class userprofile(Base):
    __tablename__ = "profile"

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
    report_count = Column(Integer, default=0, nullable=False)  # NEW

    user = relationship("registeruser", back_populates="posts")
    reports = relationship("post_reports", back_populates="post", cascade="all, delete-orphan")  # NEW

class post_reports(Base):  # NEW TABLE
    __tablename__ = "post_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    reporter_user_id = Column(Integer, ForeignKey("register_user.id"))

    __table_args__ = (UniqueConstraint('post_id', 'reporter_user_id', name='uq_post_reporter'),)

    post = relationship("posts", back_populates="reports")
    reporter = relationship("registeruser")

class subscriptions(Base):  # NEW TABLE
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    subscriber_user_id = Column(Integer, ForeignKey("register_user.id"))
    subscribed_to_user_id = Column(Integer, ForeignKey("register_user.id"))

    __table_args__ = (UniqueConstraint('subscriber_user_id', 'subscribed_to_user_id', name='uq_subscription'),)

    subscriber = relationship("registeruser", foreign_keys=[subscriber_user_id])
    subscribed_to = relationship("registeruser", foreign_keys=[subscribed_to_user_id])