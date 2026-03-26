import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-3-flash-preview")  


def llm_check(content: str) -> str:
    prompt = f"""
You are a strict AI moderator for an educational platform called TrickIT.

Your task is to classify whether a post is EDUCATIONAL or NON_EDUCATIONAL.

A post is EDUCATIONAL ONLY if it clearly contains:
• learning content
• study techniques
• coding knowledge
• exam preparation tips
• academic explanations
• problem solving strategies
• productivity methods related to learning

Examples of EDUCATIONAL posts:
- "How to remember formulas using the Feynman technique"
- "Dynamic Programming trick for solving knapsack problems"
- "3 tips to focus better while studying"
- "How to understand neural networks easily"

A post is NON_EDUCATIONAL if it contains:
• greetings
• casual messages
• celebrations
• jokes or memes
• personal updates
• emotional expressions
• unrelated conversation
• advertisements
• spam

Examples of NON_EDUCATIONAL posts:
- "Happy birthday bro!"
- "Happy anniversary mom and dad"
- "Good morning everyone"
- "Feeling sad today"
- "Check out my new phone"
- "This meme is funny"

POST:
\"\"\"{content}\"\"\"

Classification rules:
1. If the post contains NO learning value → NON_EDUCATIONAL
2. Greetings or celebrations → NON_EDUCATIONAL
3. Personal messages → NON_EDUCATIONAL
4. Random statements → NON_EDUCATIONAL

Output format:
Return ONLY one word:
educational
OR
non_educational
"""

    try:
        response = model.generate_content(prompt)

        result = response.text.strip().lower()

        if result == "educational":
            return "educational"

        return "non_educational"


    except Exception as e:
        print("LLM error:", e)
        return "non_educational"