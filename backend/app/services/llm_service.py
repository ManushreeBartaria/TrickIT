import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-3-flash-preview")  


def llm_check(content: str) -> str:
    prompt = f"""
You are an AI content moderation system for an educational platform called TrickIT.

Your task is to determine whether a post is educational.

Educational posts include:
- study tricks
- coding tips
- exam strategies
- learning techniques
- academic explanations
- problem solving methods
- productivity techniques for studying

Non-educational posts include:
- casual conversation
- memes
- random opinions
- advertisements
- spam
- irrelevant content
- offensive or harmful content

POST:
\"\"\"{content}\"\"\"

Rules:
- Reply with ONLY one word
- Either: educational
- Or: non_educational
- Do NOT explain your answer
"""

    try:
        response = model.generate_content(prompt)

        result = response.text.strip().lower()

        if "educational" in result:
            return "educational"

        return "non_educational"

    except Exception as e:
        print("LLM error:", e)
        return "non_educational"