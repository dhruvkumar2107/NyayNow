# # python_service/ml_api.py
# from fastapi import FastAPI
# from pydantic import BaseModel
# import os
# from dotenv import load_dotenv
# load_dotenv()

# # import your llm, nearby, utils (use the ones you uploaded)
# import llm
# import nearby
# import utils

# API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
# if not API_KEY:
#     print("Warning: GEMINI_API_KEY not set. llm calls will fail until configured.")
# else:
#     llm.configure_genai(API_KEY)

# app = FastAPI()

# class AnalyzeReq(BaseModel):
#     user_text: str
#     ui_lang: str = "English"
#     anon: bool = False
#     location: str = ""

# @app.post("/analyze")
# def analyze(req: AnalyzeReq):
#     prompt = llm.build_prompt(req.user_text, req.ui_lang, req.anon, req.location)
#     raw = llm.call_gemini(prompt)
#     parsed = llm.extract_json_from_text(raw)
#     return {"raw": raw, "parsed": parsed}

# class AgreementReq(BaseModel):
#     details: str
#     ui_lang: str = "English"

# @app.post("/agreement")
# def agreement(req: AgreementReq):
#     prompt = llm.build_agreement_prompt(req.details, req.ui_lang)
#     text = llm.call_gemini(prompt)
#     if req.ui_lang != "English":
#         text = utils.translate_text(text, req.ui_lang)
#     return {"text": text}

# @app.get("/nearby")
# def nearby_proxy(q: str = "", lat: float = None, lon: float = None, limit: int = 5):
#     if q and lat and lon:
#         hits = nearby.nearby_search(q, lat, lon, limit=limit)
#         return {"hits": hits}
#     if q:
#         geo = nearby.geocode_location(q)
#         return {"geo": geo}
#     return {"error": "Provide q or q+lat+lon"}

from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import llm
import nearby

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY not set")

llm.configure_genai(API_KEY)

app = FastAPI()

# ---------- MODELS ----------
class AnalyzeReq(BaseModel):
    user_text: str
    ui_lang: str = "English"
    anon: bool = False
    location: str = "India"


class AgreementReq(BaseModel):
    details: str
    ui_lang: str = "English"


# ---------- AI ASSISTANT ----------
@app.post("/analyze")
def analyze(req: AnalyzeReq):
    prompt = llm.build_prompt(
        req.user_text,
        req.ui_lang,
        req.anon,
        req.location
    )

    raw = llm.call_gemini(prompt)
    parsed = llm.extract_json_from_text(raw)

    # 🔴 THIS FIX MAKES NODE + UI WORK
    return {
        "answer": parsed.get("answer", raw),
        "related_questions": parsed.get("related_questions", []),
        "intent": parsed.get("intent", "unknown")
    }


# ---------- AGREEMENT ANALYSIS ----------

@app.post("/agreement")
def agreement(req: AgreementReq):
    prompt = llm.build_agreement_prompt(req.details, req.ui_lang)
    raw = llm.call_gemini(prompt)
    parsed = llm.extract_json_from_text(raw)
    return parsed



# ---------- CASE ANALYSIS ----------
@app.post("/case-analysis")
def case_analysis(req: AnalyzeReq):
    # Reusing AnalyzeReq as it has user_text and ui_lang
    prompt = llm.build_case_analysis_prompt(req.user_text, req.ui_lang)
    
    raw = llm.call_gemini(prompt)
    parsed = llm.extract_json_from_text(raw)
    
    return {
        "summary": parsed.get("summary", "Analysis unavailable"),
        "laws": parsed.get("laws", []),
        "advice": parsed.get("advice", raw)
    }


# ---------- NEARBY (UNCHANGED) ----------
@app.get("/nearby")
def nearby_proxy(q: str = "", lat: float = None, lon: float = None, limit: int = 5):
    if q and lat and lon:
        return {"hits": nearby.nearby_search(q, lat, lon, limit)}
    if q:
        return {"geo": nearby.geocode_location(q)}
    return {"error": "Provide q or q+lat+lon"}
