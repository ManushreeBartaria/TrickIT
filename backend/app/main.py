from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from app.database.connections import Base, engine
from app.api.routes import registerroutes
from app.model.registeruser import registeruser,forgotpasswordOTP
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",  
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
Base.metadata.create_all(bind=engine)

app.include_router(registerroutes.router, prefix="/api", tags=["register"])

@app.get("/")
def health_check():
    return {"Hello": "World"}