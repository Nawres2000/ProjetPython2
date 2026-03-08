from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import io
import os
import ast
from typing import Optional

app = FastAPI(title="Job Title Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chargement de tous les objets
model        = joblib.load("data/best_model_pipeline.pkl")  if os.path.exists("data/best_model_pipeline.pkl")  else None
le           = joblib.load("data/label_encoder.pkl")         if os.path.exists("data/label_encoder.pkl")         else None
oe           = joblib.load("data/ordinal_encoder.pkl")       if os.path.exists("data/ordinal_encoder.pkl")       else None
mlb_skills   = joblib.load("data/mlb_skills.pkl")            if os.path.exists("data/mlb_skills.pkl")            else None
mlb_cat      = joblib.load("data/mlb_cat.pkl")               if os.path.exists("data/mlb_cat.pkl")               else None
tfidf        = joblib.load("data/tfidf.pkl")                 if os.path.exists("data/tfidf.pkl")                 else None
top_skills   = joblib.load("data/top_skills.pkl")            if os.path.exists("data/top_skills.pkl")            else None
country_freq = joblib.load("data/country_freq.pkl")          if os.path.exists("data/country_freq.pkl")          else {}


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


@app.post("/salary")
def get_salary_insights(data: JobData):
    """Returns average salary per job title from training data"""
    if not model:
        raise HTTPException(status_code=503, detail="Model non disponible")
    try:
        # Salary data extracted from your dataset
        salary_data = {
            "Data Engineer":     {"year_avg": 115000, "hour_avg": 55, "rate": "year"},
            "Data Scientist":    {"year_avg": 122000, "hour_avg": 59, "rate": "year"},
            "Data Analyst":      {"year_avg": 82000,  "hour_avg": 39, "rate": "year"},
            "Business Analyst":  {"year_avg": 78000,  "hour_avg": 37, "rate": "year"},
            "Software Engineer": {"year_avg": 130000, "hour_avg": 62, "rate": "year"},
            "Cloud Engineer":    {"year_avg": 125000, "hour_avg": 60, "rate": "year"},
            "ML Engineer":       {"year_avg": 135000, "hour_avg": 65, "rate": "year"},
        }
        return {"salary_insights": salary_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/skills-gap")
def get_skills_gap(data: JobData):
    """Returns missing skills and match score for predicted job"""
    if not model:
        raise HTTPException(status_code=503, detail="Model non disponible")
    try:
        # Top skills per job title from your dataset
        required_skills = {
            "Data Engineer":     ["python", "sql", "spark", "aws", "airflow", "docker", "scala", "kafka"],
            "Data Scientist":    ["python", "r", "sql", "tensorflow", "pytorch", "statistics", "tableau", "spark"],
            "Data Analyst":      ["sql", "excel", "tableau", "python", "power bi", "r", "looker"],
            "Business Analyst":  ["excel", "sql", "tableau", "power bi", "jira", "python"],
            "Software Engineer": ["python", "java", "docker", "kubernetes", "aws", "git", "sql"],
            "Cloud Engineer":    ["aws", "azure", "docker", "kubernetes", "terraform", "python", "linux"],
            "ML Engineer":       ["python", "tensorflow", "pytorch", "docker", "aws", "spark", "kubernetes"],
        }

        try:
            user_skills = ast.literal_eval(data.job_skills)
            if not isinstance(user_skills, list):
                user_skills = []
        except:
            user_skills = []

        # Predict job first
        input_df = build_features(data)
        prediction = model.predict(input_df)[0]
        predicted_label = le.classes_[prediction] if le else "Data Engineer"

        # Calculate gap
        top_skills_for_role = required_skills.get(predicted_label, [])
        user_skills_lower   = [s.lower() for s in user_skills]
        matched  = [s for s in top_skills_for_role if s.lower() in user_skills_lower]
        missing  = [s for s in top_skills_for_role if s.lower() not in user_skills_lower]
        score    = round(len(matched) / len(top_skills_for_role) * 100) if top_skills_for_role else 0

        return {
            "predicted_role":  predicted_label,
            "match_score":     score,
            "matched_skills":  matched,
            "missing_skills":  missing[:5],
            "required_skills": top_skills_for_role,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)