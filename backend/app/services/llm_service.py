import os
from dotenv import load_dotenv

try:
    from google import genai
except ImportError:
    try:
        import google.generativeai as genai
    except ImportError:
        try:
            import generativeai as genai
        except ImportError:
            genai = None

load_dotenv()

client = None
if genai is not None:
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    except Exception:
        client = None


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

    if client is None:
        return "non_educational"

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )

        result = response.text.strip().lower()

        if "educational" in result:
            return "educational"

        return "non_educational"

    except Exception as e:
        print("LLM error:", e)
        return "non_educational"