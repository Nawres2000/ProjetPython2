from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import io
import os
import ast
import shutil
import uuid
from typing import Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
import bcrypt as _bcrypt
from jose import JWTError, jwt

app = FastAPI(title="Job Title Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth configuration ─────────────────────────────────────────────────────────
MONGODB_URI   = os.getenv("MONGODB_URI", "mongodb+srv://dbuser:rayenQ340@cluster0.9fh3r6f.mongodb.net/?appName=Cluster0")
JWT_SECRET    = os.getenv("JWT_SECRET", "change-me-in-production-use-a-long-random-string")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_H  = 24

_mongo        = MongoClient(MONGODB_URI)
_db           = _mongo["job_recommender_auth"]
users_col     = _db["users"]

bearer    = HTTPBearer()


class UserRegister(BaseModel):
    username: str
    email:    str
    password: str


class UserLogin(BaseModel):
    email:    str
    password: str


def _hash(pw: str) -> str:
    return _bcrypt.hashpw(pw.encode(), _bcrypt.gensalt()).decode()


def _verify(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def _make_token(email: str, username: str) -> str:
    payload = {
        "sub":      email,
        "username": username,
        "exp":      datetime.utcnow() + timedelta(hours=JWT_EXPIRY_H),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@app.post("/auth/register", tags=["auth"])
def register(body: UserRegister):
    if users_col.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    users_col.insert_one({
        "username":   body.username,
        "email":      body.email,
        "password":   _hash(body.password),
        "created_at": datetime.utcnow(),
    })
    token = _make_token(body.email, body.username)
    return {"token": token, "username": body.username, "email": body.email}


@app.post("/auth/login", tags=["auth"])
def login(body: UserLogin):
    user = users_col.find_one({"email": body.email})
    if not user or not _verify(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = _make_token(user["email"], user["username"])
    return {"token": token, "username": user["username"], "email": user["email"]}


@app.get("/auth/me", tags=["auth"])
def get_me(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"username": payload["username"], "email": payload["sub"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── File uploads ───────────────────────────────────────────────────────────────
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB


def _get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = users_col.find_one({"email": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _save_upload(file: UploadFile, subfolder: str) -> str:
    """Save uploaded file to disk, return relative URL path."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, DOCX files are allowed")
    content = file.file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 5 MB limit")
    dest_dir = os.path.join(UPLOADS_DIR, subfolder)
    os.makedirs(dest_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(dest_dir, filename)
    with open(dest_path, "wb") as f:
        f.write(content)
    return f"/uploads/{subfolder}/{filename}"


@app.post("/auth/profile/upload-cv", tags=["profile"])
async def upload_cv(
    file: UploadFile = File(...),
    current_user: dict = Depends(_get_current_user),
):
    # Delete old CV file from disk if it exists
    old_path = current_user.get("cv_path")
    if old_path:
        old_full = os.path.join(os.path.dirname(__file__), old_path.lstrip("/"))
        if os.path.exists(old_full):
            os.remove(old_full)
    path = _save_upload(file, "cv")
    users_col.update_one(
        {"email": current_user["email"]},
        {"$set": {"cv_path": path, "cv_filename": file.filename}},
    )
    return {"path": path, "filename": file.filename}


@app.post("/auth/profile/upload-cover", tags=["profile"])
async def upload_cover(
    file: UploadFile = File(...),
    current_user: dict = Depends(_get_current_user),
):
    old_path = current_user.get("cover_path")
    if old_path:
        old_full = os.path.join(os.path.dirname(__file__), old_path.lstrip("/"))
        if os.path.exists(old_full):
            os.remove(old_full)
    path = _save_upload(file, "cover")
    users_col.update_one(
        {"email": current_user["email"]},
        {"$set": {"cover_path": path, "cover_filename": file.filename}},
    )
    return {"path": path, "filename": file.filename}


@app.delete("/auth/profile/upload-cv", tags=["profile"])
def delete_cv(current_user: dict = Depends(_get_current_user)):
    old_path = current_user.get("cv_path")
    if old_path:
        old_full = os.path.join(os.path.dirname(__file__), old_path.lstrip("/"))
        if os.path.exists(old_full):
            os.remove(old_full)
    users_col.update_one(
        {"email": current_user["email"]},
        {"$unset": {"cv_path": "", "cv_filename": ""}},
    )
    return {"detail": "CV removed"}


@app.delete("/auth/profile/upload-cover", tags=["profile"])
def delete_cover(current_user: dict = Depends(_get_current_user)):
    old_path = current_user.get("cover_path")
    if old_path:
        old_full = os.path.join(os.path.dirname(__file__), old_path.lstrip("/"))
        if os.path.exists(old_full):
            os.remove(old_full)
    users_col.update_one(
        {"email": current_user["email"]},
        {"$unset": {"cover_path": "", "cover_filename": ""}},
    )
    return {"detail": "Cover letter removed"}


class ProfileUpdate(BaseModel):
    title:    Optional[str] = None
    phone:    Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    bio:      Optional[str] = None
    skills:   Optional[list] = None
    educations:  Optional[list] = None
    experiences: Optional[list] = None


@app.get("/auth/profile", tags=["profile"])
def get_profile(current_user: dict = Depends(_get_current_user)):
    return {
        "username":       current_user.get("username"),
        "email":          current_user.get("email"),
        "title":          current_user.get("title", ""),
        "phone":          current_user.get("phone", ""),
        "location":       current_user.get("location", ""),
        "linkedin":       current_user.get("linkedin", ""),
        "bio":            current_user.get("bio", ""),
        "skills":         current_user.get("skills", []),
        "educations":     current_user.get("educations", []),
        "experiences":    current_user.get("experiences", []),
        "cv_path":        current_user.get("cv_path"),
        "cv_filename":    current_user.get("cv_filename"),
        "cover_path":     current_user.get("cover_path"),
        "cover_filename": current_user.get("cover_filename"),
    }


@app.put("/auth/profile", tags=["profile"])
def save_profile(body: ProfileUpdate, current_user: dict = Depends(_get_current_user)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        users_col.update_one({"email": current_user["email"]}, {"$set": update})
    return {"detail": "Profile saved"}



# ── ML models ──────────────────────────────────────────────────────────────────
model        = joblib.load("/data/best_model_pipeline.pkl")  if os.path.exists("/data/best_model_pipeline.pkl")  else None
le           = joblib.load("/data/label_encoder.pkl")         if os.path.exists("/data/label_encoder.pkl")         else None
oe           = joblib.load("/data/ordinal_encoder.pkl")       if os.path.exists("/data/ordinal_encoder.pkl")       else None
mlb_skills   = joblib.load("/data/mlb_skills.pkl")            if os.path.exists("/data/mlb_skills.pkl")            else None
mlb_cat      = joblib.load("/data/mlb_cat.pkl")               if os.path.exists("/data/mlb_cat.pkl")               else None
tfidf        = joblib.load("/data/tfidf.pkl")                 if os.path.exists("/data/tfidf.pkl")                 else None
top_skills   = joblib.load("/data/top_skills.pkl")            if os.path.exists("/data/top_skills.pkl")            else None
country_freq = joblib.load("/data/country_freq.pkl")          if os.path.exists("/data/country_freq.pkl")          else {}
class JobData(BaseModel):
    job_title:             str
    job_via:               Optional[str]  = "Unknown"
    job_schedule_type:     Optional[str]  = "Full-time"
    job_location:          Optional[str]  = "Unknown"
    search_location:       Optional[str]  = "Unknown"
    company_name:          Optional[str]  = "Unknown"
    job_country:           Optional[str]  = "Unknown"
    job_work_from_home:    Optional[int]  = 0
    job_no_degree_mention: Optional[int]  = 0
    job_health_insurance:  Optional[int]  = 0
    posted_year:           Optional[int]  = 2024
    posted_month:          Optional[int]  = 1
    posted_day:            Optional[int]  = 1
    job_skills:            Optional[str]  = "[]"
    job_type_skills:       Optional[str]  = "{}"

    class Config:
        json_schema_extra = {
            "example": {
                "job_title": "Senior Data Engineer",
                "job_via": "LinkedIn",
                "job_schedule_type": "Full-time",
                "job_location": "New York, NY",
                "search_location": "United States",
                "company_name": "Amazon",
                "job_country": "United States",
                "job_work_from_home": 1,
                "job_no_degree_mention": 0,
                "job_health_insurance": 1,
                "posted_year": 2024,
                "posted_month": 3,
                "posted_day": 15,
                "job_skills": "['python', 'sql', 'spark', 'aws']",
                "job_type_skills": "{'cloud': ['aws'], 'libraries': ['spark'], 'databases': ['sql']}"
            }
        }


def build_features(data: JobData) -> pd.DataFrame:
    # 1. Parser skills
    try:
        job_skills_list = ast.literal_eval(data.job_skills)
    except:
        job_skills_list = []

    try:
        job_type_skills_dict = ast.literal_eval(data.job_type_skills)
        if not isinstance(job_type_skills_dict, dict):
            job_type_skills_dict = {}
    except:
        job_type_skills_dict = {}

    skill_categories = list(job_type_skills_dict.keys())

    # 2. Skills binarizer
    skills_arr = mlb_skills.transform([job_skills_list]).astype(np.int8)
    skills_df  = pd.DataFrame(skills_arr, columns=[f'skill_{s}' for s in top_skills])

    # 3. Categories binarizer
    cat_arr = mlb_cat.transform([skill_categories]).astype(np.int8)
    cat_df  = pd.DataFrame(cat_arr, columns=[f'cat_{c}' for c in mlb_cat.classes_])

    # 4. Skill counts
    skill_counts_dict = {f'n_{k}': len(v) for k, v in job_type_skills_dict.items()}
    skill_counts_df   = pd.DataFrame([skill_counts_dict]).fillna(0).astype(np.int8)

    # 5. Country freq
    country_freq_enc = float(country_freq.get(data.job_country, 0.0))

    # 6. TF-IDF
    tfidf_arr = tfidf.transform([data.job_title]).toarray().astype(np.float32)
    tfidf_df  = pd.DataFrame(tfidf_arr, columns=[f'title_{t}' for t in tfidf.get_feature_names_out()])

    # 7. Ordinal encoding
    ordinal_cols = ['job_via', 'job_schedule_type', 'job_location', 'search_location', 'company_name']
    ord_raw = pd.DataFrame([[data.job_via, data.job_schedule_type, data.job_location,
                              data.search_location, data.company_name]], columns=ordinal_cols).astype(str)
    ord_df  = pd.DataFrame(oe.transform(ord_raw), columns=ordinal_cols)

    # 8. Base features — meme ordre que le notebook
    base_df = pd.DataFrame([{
        'job_work_from_home':    data.job_work_from_home,
        'job_no_degree_mention': data.job_no_degree_mention,
        'job_health_insurance':  data.job_health_insurance,
        'posted_year':           data.posted_year,
        'posted_month':          data.posted_month,
        'posted_day':            data.posted_day,
        'num_skills':            len(job_skills_list),
        'num_skill_categories':  len(skill_categories),
        'country_freq_enc':      country_freq_enc,
        'job_via':               ord_df['job_via'].values[0],
        'job_schedule_type':     ord_df['job_schedule_type'].values[0],
        'job_location':          ord_df['job_location'].values[0],
        'search_location':       ord_df['search_location'].values[0],
        'company_name':          ord_df['company_name'].values[0],
    }])

    # 9. Assembler — meme ordre que X dans le notebook
    # 9. Assembler
    input_df = pd.concat([base_df, skills_df.reset_index(drop=True),
                          cat_df.reset_index(drop=True), skill_counts_df.reset_index(drop=True),
                          tfidf_df.reset_index(drop=True)], axis=1)

    # 10. Aligner avec les colonnes du modele — ajoute les manquantes avec 0
    for col in model.feature_names_in_:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[model.feature_names_in_]

    return input_df

@app.get("/health")
def health_check():
    if model:
        return {"status": "ok", "model_loaded": True}
    return {"status": "degraded", "model_loaded": False}

@app.post("/predict")
def predict_job(data: JobData):
    if not model:
        raise HTTPException(status_code=503, detail="Modele non disponible")
    try:
        input_df   = build_features(data)
        prediction = model.predict(input_df)[0]
        probas     = model.predict_proba(input_df)[0]
        predicted_label = le.classes_[prediction] if le else str(prediction)
        prob_dict = {cls: round(float(p), 4) for cls, p in zip(le.classes_, probas)} if le else {}
        return {"predicted_class": int(prediction), "predicted_label": predicted_label, "probabilities": prob_dict}
    except Exception as e:
        print(f"ERREUR: {e}")   # ← ajoute cette ligne
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/predict_batch")
async def predict_batch(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=503, detail="Modele non disponible")
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        required_cols = ['job_title', 'job_via', 'job_schedule_type', 'job_location',
                         'search_location', 'company_name', 'job_country', 'job_work_from_home',
                         'job_no_degree_mention', 'job_health_insurance', 'posted_year',
                         'posted_month', 'posted_day', 'job_skills', 'job_type_skills']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(status_code=400, detail=f"Colonnes manquantes : {missing}")
        results = []
        for _, row in df.iterrows():
            job = JobData(**{c: row.get(c) for c in required_cols})
            prediction = model.predict(build_features(job))[0]
            results.append(le.classes_[prediction] if le else str(prediction))
        df['Predicted_Label'] = results
        return df.to_dict(orient='records')
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)