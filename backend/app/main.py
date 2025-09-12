from fastapi import FastAPI
from app.database.connections import Base, engine
from app.api.routes import registerroutes
from app.model.registeruser import registeruser

app = FastAPI()
Base.metadata.create_all(bind=engine)

app.include_router(registerroutes.router, prefix="/api", tags=["register"])

@app.get("/")
def health_check():
    return {"Hello": "World"}