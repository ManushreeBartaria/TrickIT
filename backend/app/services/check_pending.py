    
from sqlalchemy.orm import Session
from sqlalchemy import text
import requests

def check_and_trigger(db: Session):
    result = db.execute(
        text("SELECT COUNT(*) FROM under_review_posts WHERE status='pending'")
    )
    count = result.scalar()

    print("Pending count:", count)

    if count > 0:
        print("Triggering LLM processing...")

        response = requests.post(
            "http://localhost:8000/llm-processing"
        )

        return {
            "status": "triggered",
            "response": response.text
        }

    return {
        "status": "no pending posts"
    }