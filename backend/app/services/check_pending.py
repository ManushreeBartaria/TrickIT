from sqlalchemy.orm import Session
from sqlalchemy import text
import requests

def check_and_trigger(db: Session):

    post = db.execute(
        text("""
        SELECT id 
        FROM under_review_posts 
        WHERE status='pending'
        LIMIT 1
        """)
    ).fetchone()

    if not post:
        return {"status": "no pending posts"}

    post_id = post[0]

    print("Processing post:", post_id)

    response = requests.post(
        f"http://localhost:8000/api/llm-processing/{post_id}"
    )

    return {
        "status": "triggered",
        "post_id": post_id,
        "response": response.text
    }