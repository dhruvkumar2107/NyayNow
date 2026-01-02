# import google.generativeai as genai
# import json

# def configure_genai(api_key):
#     genai.configure(api_key=api_key)

# def build_prompt(user_text, ui_lang="English", anon=False, location=""):
#     base = f"You are a helpful legal AI assistant called Nyay Sathi. Answer the user's legal question in {ui_lang}."
#     if location:
#         base += f" The user is in {location}, so consider local laws if applicable."
#     if anon:
#         base += " The user wishes to remain anonymous, so do not ask for personal details."
    
#     base += f"\n\nUser Question: {user_text}"
#     base += "\n\nProvide a structured response in JSON format with fields: 'answer' (markdown supported text), 'related_questions' (list of 3 strings), 'intent' (e.g., 'divorce', 'property')."
#     return base

# def build_agreement_prompt(text, ui_lang="English"):
#     return f"""
#     Analyze the following legal agreement text in {ui_lang}. 
#     Identify:
#     1. Key Risks (list)
#     2. Important Clauses (list)
#     3. Red Flags (list)
    
#     Text: {text[:5000]}
    
#     Return pure JSON structure: {{ "risks": [], "clauses": [], "redFlags": [] }}
#     """

# def call_gemini(prompt):
#     try:
#         model = genai.GenerativeModel('gemini-pro')
#         response = model.generate_content(prompt)
#         return response.text
#     except Exception as e:
#         return json.dumps({"answer": f"AI Error: {str(e)}", "related_questions": [], "intent": "error"})

# def extract_json_from_text(text):
#     # Gemini might wrap json in markdown code blocks
#     text = text.strip()
#     if text.startswith("```json"):
#         text = text[7:]
#     if text.endswith("```"):
#         text = text[:-3]
#     try:
#         return json.loads(text)
#     except:
#         return {"answer": text, "related_questions": [], "intent": "unknown"}

import google.generativeai as genai
import json

def configure_genai(api_key):
    genai.configure(api_key=api_key)

def build_prompt(user_text, ui_lang="English", anon=False, location=""):
    base = f"You are a helpful legal AI assistant called Nyay Sathi. Answer the user's legal question in {ui_lang}."

    if location:
        base += f" The user is in {location}, so consider local laws if applicable."
    if anon:
        base += " The user wishes to remain anonymous, so do not ask for personal details."

    base += f"""

User Question:
{user_text}

Return ONLY valid JSON in this exact format:
{{
  "answer": "clear legal answer in markdown",
  "related_questions": ["q1", "q2", "q3"],
  "intent": "legal_topic"
}}
"""
    return base



def build_agreement_prompt(text, ui_lang="English"):
    return f"""
Analyze the following legal agreement in {ui_lang}.

Return JSON:
{{
  "risks": [],
  "clauses": [],
  "redFlags": []
}}

Text:
{text[:5000]}
"""


def build_case_analysis_prompt(text, ui_lang="English"):
    return f"""
Analyze the following legal issue/situation in {ui_lang}.

Return JSON with these exact keys:
{{
  "summary": "Brief summary of the legal situation",
  "laws": ["List of relevant acts/sections (e.g. IPC Section 420, Contract Act)"],
  "advice": "Actionable legal advice or next steps"
}}

User Situation:
{text[:4000]}
"""


def call_gemini(prompt):
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(prompt)
    return response.text


def extract_json_from_text(text):
    text = text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "")

    try:
        return json.loads(text)
    except Exception:
        return {
            "answer": text,
            "related_questions": [],
            "intent": "unknown"
        }
